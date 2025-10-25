import express from 'express';
import db from '../../db.js'; 

const router = express.Router();

router.get('/login', (req, res) => {
  res.render('./login/login.ejs');
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Try username first
    const [users] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
    let user = users[0];

    // If not found, try email
    if (!user) {
      const [usersByEmail] = await db.query('SELECT * FROM users WHERE email = ?', [username]);
      user = usersByEmail[0];
    }

    if (!user) {
      return res.render('./login/login.ejs', { message: 'User not found' });
    }

    if (user.password === password) {
      req.session.user = user;
      if (user.role === 'admin') return res.redirect('/admin/dashboard');
      if (user.role === 'author') return res.redirect('/author/dashboard');
    } else {
      res.render('./login/login.ejs', { message: 'Invalid username or password' });
    }
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).render('./login/login.ejs', { message: 'Database error' });
  }
});

export default router;
