const express = require("express");
const path = require("path");
const fs = require("fs");
const cloudinary = require("../config/cloudinary");
const authMiddleware = require("../middleware/auth");
const fileModel = require("../models/files.model");
const multer = require("multer");

const router = express.Router();

// Redirect to user signup page
router.get("/", (req, res) => {
  res.redirect("/user/signup");
});

// Home Route (Protected)
router.get("/home", authMiddleware, async (req, res) => {
    if (!req.user || !req.user.userId) {
        return res.redirect("/user/login");
    }

    const userFiles = await fileModel.find({ user: req.user.userId });

    // Ensure username is passed to EJS
    res.render("home", { username: req.user.name || "User", files: userFiles });
});


// Storage setup (files will be stored in 'uploads/' folder)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
      cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
      cb(null, file.fieldname + "-" + Date.now() + path.extname(file.originalname));
  },
});

// File upload settings (allow all types)
const upload = multer({
  storage: storage,
  limits: { fileSize: 100000000 }, // 100MB limit
}).any(); // Accepts all file types

// Upload Route
router.post("/upload", authMiddleware, async (req, res) => {
  if (!req.files || !req.files.file) {
    return res.status(400).json({ error: "No file uploaded." });
  }

  try {
    const uploadedFile = req.files.file;
    const tempPath = path.join(__dirname, "../uploads", uploadedFile.name);

    await uploadedFile.mv(tempPath);

    const result = await cloudinary.uploader.upload(tempPath, {
      folder: "myfiles",
      use_filename: true,
    });

    await fileModel.create({
      cloudinaryUrl: result.secure_url,
      publicId: result.public_id,
      originalname: uploadedFile.name,
      localpath: tempPath,
      user: req.user.userId,
    });

    fs.unlinkSync(tempPath);
res.redirect('home');
    // res.json({ message: "File uploaded successfully!", url: result.secure_url });
  } catch (error) {
    console.error("Upload Error:", error);
    res.status(500).json({ error: "File upload failed." });
  }
});

// delete file
router.delete('/delete/:id', authMiddleware, async (req, res) => {
  try {
      const file = await fileModel.findById(req.params.id);
      if (!file) {
          return res.status(404).json({ success: false, error: "File not found" });
      }

      // Delete from Cloudinary
      await cloudinary.uploader.destroy(file.publicId);

      // Delete from database
      await fileModel.findByIdAndDelete(req.params.id);

      res.json({ success: true, message: "File deleted successfully!" });
  } catch (err) {
      console.error("Delete Error:", err);
      res.status(500).json({ success: false, error: err.message });
  }
});


// Download Route
const axios = require("axios");

router.get("/download/:id", authMiddleware, async (req, res) => {
  try {
    const file = await fileModel.findOne({ user: req.user.userId, _id: req.params.id });

    if (!file) {
      return res.status(404).json({ error: "File not found in database." });
    }

    // Check if file exists in Cloudinary
    const cloudinaryResponse = await axios.head(file.cloudinaryUrl).catch(err => null);
    if (!cloudinaryResponse || cloudinaryResponse.status !== 200) {
      return res.status(404).json({ error: "File not found on Cloudinary." });
    }

    // Stream the file
    const response = await axios.get(file.cloudinaryUrl, { responseType: "stream" });
    res.setHeader("Content-Disposition", `attachment; filename="${file.originalname}"`);
    response.data.pipe(res);
  } catch (error) {
    console.error("Download Error:", error);
    res.status(500).json({ error: "Failed to download file." });
  }
});



module.exports = router;