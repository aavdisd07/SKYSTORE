const jwt = require("jsonwebtoken");
const UserModel = require("../models/user.model"); // Import the user model

async function auth(req, res, next) {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({ message: "Unauthorized User" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Fetch the user details from the database
        const user = await UserModel.findById(decoded.userId).select("name");
        if (!user) {
            return res.status(401).json({ message: "Unauthorized User" });
        }

        req.user = { userId: decoded.userId, name: user.name }; // Store name in req.user
        next();
    } catch (err) {
        return res.status(401).json({ message: "Unauthorized User" });
    }
}

module.exports = auth;
