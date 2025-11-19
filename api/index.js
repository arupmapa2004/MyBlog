import ServerlessHttp from "serverless-http";
import express from "express";
import session from "express-session";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { testDBConnection } from "./db.js";

import loginRouter from "../src/routes/login.js";
import authorRouter from "../src/routes/author.js";
import adminRouter from "../src/routes/admin.js";
import articleRouter from "../src/routes/articles.js";
import homeRouter from "../src/routes/home.js";

dotenv.config();

const app = express();

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// View Engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "../src/views"));

// Static files
app.use(express.static(path.join(__dirname, "../public")));

app.use(
  session({
    resave: false,
    saveUninitialized: true,
    secret: process.env.SESSION_SECRET,
  })
);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Middlewares
const userAuth = (req, res, next) => {
  if (req.session && req.session.user) next();
  else res.redirect("/login");
};

const adminAuth = (req, res, next) => {
  if (req.session?.user?.role === "admin") next();
  else res.send("Invalid access");
};

const authorAuth = (req, res, next) => {
  if (req.session?.user?.role === "author") next();
  else res.send("Invalid access");
};

// Routes
app.use("/", loginRouter);
app.use("/", homeRouter);
app.use("/admin", userAuth, adminAuth, adminRouter);
app.use("/author", userAuth, authorAuth, authorRouter);
app.use("/article", userAuth, articleRouter);

// Connect DB once per cold start
let dbInitialized = false;
const ensureDBConnection = async () => {
  if (!dbInitialized) {
    try {
      await testDBConnection();
      dbInitialized = true;
    } catch (err) {
      console.error("DB connect error:", err);
    }
  }
};

// Serverless handler (NO app.listen)
export default async function handler(req, res) {
  await ensureDBConnection();
  const wrappedHandler = ServerlessHttp(app);
  return wrappedHandler(req, res);
}
