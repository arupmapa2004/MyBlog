import express from 'express';
import db from '../../db.js';

const router = express.Router();

router.get('/dashboard', async (req, res) => {
  try {
    if (!req.session || !req.session.user) {
      return res.redirect('/login');
    }

    const [articles] = await db.query(
      'SELECT * FROM articles WHERE user_username = ?',
      [req.session.user.username]
    );
    res.render('./author/dashboard.ejs', {
      user: req.session.user,
      articles,
      message: req.session.message
    });
    req.session.message = null;
  } catch (err) {
    console.error('Error loading author dashboard:', err);
    res.status(500).send('Server error');
  }
});

export default router;
