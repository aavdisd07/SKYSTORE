const express = require("express");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const userModel = require("../models/user.model");

const router = express.Router();

// Show Signup Form
router.get("/signup", (req, res) => {
  res.render("signup");
});

// Signup Logic
router.post(
  "/signup",
  [
    body("email").isEmail().trim(),
    body("password").isLength({ min: 5 }).trim(),
    body("name").isLength({ min: 3 }).trim(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, name, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    await userModel.create({ email, name, password: hashedPassword });

    res.redirect("/user/login");
  }
);

// Show Login Form
router.get("/login", (req, res) => {
  res.render("login");
});

// Login Logic
router.post("/login", async (req, res) => {
  const user = await userModel.findOne({ name: req.body.name });

  if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
    return res.status(400).json({ message: "Invalid credentials" });
  }

  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
  res.cookie("token", token, { httpOnly: true });
  res.redirect("/home");
});

module.exports = router;