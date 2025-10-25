import express from 'express';
import session from 'express-session';
import dotenv from 'dotenv';
import db, { testDBConnection } from './db.js';

import loginRouter from './src/routes/login.js';
import authorRouter from './src/routes/author.js';
import adminRouter from './src/routes/admin.js';
import articleRouter from './src/routes/articles.js';
import homeRouter from './src/routes/home.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3033;

app.set('view engine', 'ejs');
app.set('views', './src/views');

app.use(session({
  resave: false,
  saveUninitialized: true,
  secret: process.env.SESSION_SECRET
}));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('./public'));

// Routes
app.use('/', loginRouter);

const userAuth = (req, res, next) => {
  if (req.session && req.session.user) next();
  else res.redirect('/login');
};

const adminAuth = (req, res, next) => {
  if (req.session.user.role === 'admin') next();
  else res.send('Invalid access');
};

const authorAuth = (req, res, next) => {
  if (req.session.user.role === 'author') next();
  else res.send('Invalid access');
};
app.use('/', homeRouter);
app.use('/admin', userAuth, adminAuth, adminRouter);
app.use('/author', userAuth, authorAuth, authorRouter);
app.use('/article', userAuth, articleRouter);

const startServer = async () => {
  await testDBConnection();
  app.listen(PORT, () => {
    console.log(`🚀 Server started on port ${PORT}`);
  });
};

startServer();
