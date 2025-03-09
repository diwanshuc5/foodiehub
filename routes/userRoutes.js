const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Restaurant = require("../models/Restaurant");
const authMiddleware = require("../middleware/authMiddleware"); // Protect routes
const bcrypt = require("bcryptjs");

// Add to Favorites
router.post("/favorites/:restaurantId", authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        const restaurant = await Restaurant.findById(req.params.restaurantId); // Get restaurant by ID

        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized, token failed" });
        }

        if (!user) {
            console.log("User not found");
            return res.status(404).json({ message: "User not found" });
        }

        if (!restaurant) {
            return res.status(404).json({ message: "Restaurant not found" });
        }

        if (user.favorites.includes(restaurant._id)) {
            return res.status(400).json({ message: "Already in favorites" }); // Check if restaurant is already in favorites
        }

        user.favorites.push(restaurant._id); // Add restaurant to favorites
        await user.save();

        res.status(200).json({ message: "Restaurant added to favorites", favorites: user.favorites }); // Send response with updated favorites array in user object 
    } catch (err) {
        console.error("Error adding to favorites:", err);
        res.status(500).json({ message: "Server error" });
    }
});

// Remove from Favorites
router.delete("/favorites/:restaurantId", authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        user.favorites = user.favorites.filter(id => id.toString() !== req.params.restaurantId);

        await user.save();

        res.status(200).json({ message: "Restaurant removed from favorites", favorites: user.favorites });
    } catch (error) {
        console.error("Error removing from favorites:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// Get Favorite Restaurants
router.get("/favorites", authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).populate("favorites");

        res.status(200).json({ favorites: user.favorites });
    } catch (error) {
        console.error("Error fetching favorites:", error);
        res.status(500).json({ message: "Server error" });
    }
});


// Update User Profile
router.put("/profile", authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        const { name, email, password } = req.body;

        if (name) user.name = name;
        if (email) user.email = email;

        if (password) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);
        }

        await user.save();
        res.status(200).json({ message: "Profile updated successfully" });

    } catch (err) {
        console.error("Error updating profile:", err);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;