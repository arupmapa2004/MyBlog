// app.js
import express from "express";
import session from "express-session";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { testDBConnection } from "./db.js";

import loginRouter from "./src/routes/login.js";
import authorRouter from "./src/routes/author.js";
import adminRouter from "./src/routes/admin.js";
import articleRouter from "./src/routes/articles.js";
import homeRouter from "./src/routes/home.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Fix __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// View Engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "src/views"));

// Static Files
app.use(express.static(path.join(__dirname, "public")));

// Middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
  })
);

// Auth middlewares
const userAuth = (req, res, next) => {
  if (req.session && req.session.user) return next();
  return res.redirect("/login");
};

const adminAuth = (req, res, next) => {
  if (req.session.user?.role === "admin") return next();
  return res.send("Invalid access");
};

const authorAuth = (req, res, next) => {
  if (req.session.user?.role === "author") return next();
  return res.send("Invalid access");
};

// Routes
app.use("/", loginRouter);
app.use("/", homeRouter);
app.use("/admin", userAuth, adminAuth, adminRouter);
app.use("/author", userAuth, authorAuth, authorRouter);
app.use("/article", userAuth, articleRouter);

// Start server
app.listen(PORT, async () => {
  await testDBConnection();
  console.log(`🚀 Server running on port ${PORT}`);
});
