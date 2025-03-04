const express = require("express");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const path = require("path");
const fileUpload = require("express-fileupload");
const session = require("express-session"); // Add this line

dotenv.config();
const connectToDB = require("./config/db");
const userRouter = require("./routes/user.routes");
const indexRouter = require("./routes/index.routes");

connectToDB();

const app = express();
app.set("view engine", "ejs");
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Add session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'your_secret_key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: process.env.NODE_ENV === 'production' } // Use secure cookies in production
}));

// File Upload Middleware
app.use(fileUpload({ useTempFiles: true, tempFileDir: "/tmp/" }));

// Serve static files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Route Middleware
app.use("/user", userRouter);
app.use("/", indexRouter);

app.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: "Logout failed" });
    }

    // Clear session cookie
    res.clearCookie("connect.sid", { path: "/", domain: "localhost", httpOnly: true });

    // Clear token cookie if exists
    res.clearCookie("token", { path: "/", domain: "localhost", httpOnly: true });

    return res.redirect("/user/login"); // Redirect to login page
  });
});
const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});