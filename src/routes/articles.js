import express from 'express';
import db from '../../api/db.js';
import multer from 'multer';
import path from 'path';


const router = express.Router();

const storage = multer.diskStorage({
    destination: './public/images',
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({
    storage: storage,
    fileFilter: function (req, file, cb) {
        const extension = path.extname(file.originalname).toLowerCase();
        if (['.jpg', '.jpeg', '.png'].includes(extension)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type'));
        }
    }
});


router.get('/add', (req, res) => {
    res.render('./articles/add.ejs');
});

router.post('/add', upload.single('image'), async (req, res) => {
    try {
        const { title, content } = req.body;
        const image = req.file?.filename || null;
        const username = req.session?.user?.username;

        if (!title || !content || !username) {
            return res.status(400).render('./articles/add', { success: false, message: 'Missing required fields' });
        }

        await db.query(
            "INSERT INTO articles (title, content, image, user_username) VALUES (?, ?, ?, ?)",
            [title, content, image, username]
        );

        req.session.message = 'Article added successfully';
        if(req.session.user.role === "admin")
        {
          res.redirect('/admin/dashboard');
        }
        else{
         res.redirect('/author/dashboard');
        }
    } catch (error) {
        console.error(error);
        res.status(500).render('./articles/add', { success: false, message: 'Error adding record' });
    }
});

router.get('/delete/:id', async (req, res) => {
    try {
        const [article] = await db.query("SELECT * FROM articles WHERE articleId = ?", [req.params.id]);

        if (!article || article.length === 0) {
            return res.status(404).json({ message: 'Article Not Found' });
        }

        await db.query("DELETE FROM articles WHERE articleId = ?", [req.params.id]);

        return res.json({
            success: true,
            message: 'Article Deleted Successfully'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Error deleting article' });
    }
});

export default router;
