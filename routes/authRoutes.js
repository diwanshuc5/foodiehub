const express = require("express");
const User = require("../models/User");
const jwt = require("jsonwebtoken");

const router = express.Router();

// Signup Route (Register User)
router.post("/register", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Check if user already exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: "User already exists" });
        }

        // Create new user
        user = new User({ name, email, password });
        await user.save();

        // Generate JWT token
        const token = jwt.sign({ userId: user._id }, "secretkey", { expiresIn: "1h" });

        res.status(201).json({ token, userId: user._id, name: user.name });
    } catch (error) {
        console.error("Error registering user:", error);
        res.status(500).json({ message: "Server Error" });
    }
});

// Login Route (Authenticate User)
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // Generate JWT token
        const token = jwt.sign({ userId: user._id }, "secretkey", { expiresIn: "1h" });

        res.status(200).json({ token, userId: user._id, name: user.name });
    } catch (error) {
        console.error("Error logging in:", error);
        res.status(500).json({ message: "Server Error" });
    }
});

module.exports = router;
