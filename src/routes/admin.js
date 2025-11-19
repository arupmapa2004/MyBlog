import express from 'express';
import db from '../../api/db.js';

const router = express.Router();

router.get('/dashboard', async (req, res) => {
    try {
        const [articles] = await db.query("SELECT * FROM articles");
        const [users] = await db.query("SELECT * FROM users");
        res.render('./admin/dashboard.ejs', {
            user: req.session.user,
            articles,
            users,
            message: req.session.message
        });
        req.session.message = null;
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Error loading dashboard' });
    }
});

router.get('/addUser', (req, res) => {
    res.render('./admin/adduser.ejs');
});

router.post('/addUser', async (req, res) => {
    try {
        const { name, email, password, username, role } = req.body;

        const [userByUsername] = await db.query(
            "SELECT * FROM users WHERE username = ?",
            [username]
        );

        if (userByUsername.length > 0) {
            return res.send('Username already exists');
        }

        const [userByEmail] = await db.query(
            "SELECT * FROM users WHERE email = ?",
            [email]
        );

        if (userByEmail.length > 0) {
            return res.send('Email already exists');
        }

        await db.query(
            "INSERT INTO users (name, email, password, username, role) VALUES (?, ?, ?, ?, ?)",
            [name, email, password, username, role]
        );

        req.session.message = 'User added successfully';
        res.redirect('/admin/dashboard');
        
    } catch (err) {
        console.error(err);
        res.status(500).send('Error adding user');
    }
});

router.get('/deleteUser/:username', async (req, res) => {
    try {
        const [users] = await db.query(
            "SELECT * FROM users WHERE username = ?",
            [req.params.username]
        );

        if (users.length === 0) {
            return res.json({ success: false, message: 'User not found' });
        }

        await db.query(
            "DELETE FROM users WHERE username = ?",
            [req.params.username]
        );

        return res.json({
            success: true,
            message: 'User deleted successfully'
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Error deleting user' });
    }
});

export default router;
