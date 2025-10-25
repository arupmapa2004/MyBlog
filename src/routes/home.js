import express from 'express';
import db from '../../db.js';

const router = express.Router();

// Home page – show all articles
router.get('/', async (req, res) => {
  try {
    const [articles] = await db.query('SELECT * FROM articles');
    res.render('./home/home.ejs', { articles });
  } catch (err) {
    console.error('Error fetching articles:', err);
    res.status(500).send('Server error');
  }
});

// Single post page – show one article
router.get('/post/:id', async (req, res) => {
  try {
    const [articles] = await db.query('SELECT * FROM articles WHERE articleId = ?', [req.params.id]);

    if (articles.length === 0) {
      return res.status(404).send('Article not found');
    }

    const article = articles[0]; // ✅ get the first row
    res.render('./home/post.ejs', { article });
  } catch (err) {
    console.error('Error fetching article:', err);
    res.status(500).send('Server error');
  }
});

export default router;
