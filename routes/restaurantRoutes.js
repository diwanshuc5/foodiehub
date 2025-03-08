const express = require("express");
const Restaurant = require("../models/Restaurant");
const authMiddleware = require("../middleware/authMiddleware");
const router = express.Router();

// Create a new restaurant
router.post("/restaurants", authMiddleware, async (req, res) => {
    const { name, cuisine, location, rating } = req.body;

    try {
        const newRestaurant = new Restaurant({
            name,
            cuisine,
            location,
            rating, 
            userId: req.user.userId // Get user ID from JWT token
        });

        await newRestaurant.save();
        res.status(201).json(newRestaurant);
    } catch (error) {
        console.error(error);
        console.error("Error creating restaurant:", error);
        res.status(500).json({ message: "Server Error" });
    }
});

// Get all restaurants
router.get("/restaurants", async (req, res) => {
    const { page = 1, limit = 10, search, cuisine, location, sort } = req.query;

    try {
        const pageNumber = parseInt(page, 10);
        const pageLimit = parseInt(limit, 10);
        const skip = (pageNumber - 1) * pageLimit;

        let query = {}; // Empty query (will be updated with filters)

        // Search by restaurant name (case-insensitive)
        if (search) {
            query.name = { $regex: search, $options: "i" }; // "i" makes it case insensitive
        }

        // Filter by cuisine
        if (cuisine) {
            query.cuisine = cuisine;
        }

        // Filter by location
        if (location) {
            query.location = location;
        }

        // Sorting (default is by name)
        let sortOption = { name: 1 }; // Sort by name (ascending)
        if (sort === "rating") {
            sortOption = { rating: -1 }; // Sort by rating (highest first)
        }

        // Fetch the restaurants with filtering, searching, sorting, and pagination
        const restaurants = await Restaurant.find(query)
            .sort(sortOption)
            .skip(skip)
            .limit(pageLimit);

        // Count the total restaurants matching the filters
        const totalCount = await Restaurant.countDocuments(query);

        // Send response
        res.status(200).json({
            currentPage: pageNumber,
            totalPages: Math.ceil(totalCount / pageLimit),
            totalCount,
            restaurants
        });
    } catch (error) {
        console.error("Error fetching restaurants:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// Get a single restaurant by ID
router.get("/restaurants/:id", async (req, res) => {
    try {
        const restaurant = await Restaurant.findById(req.params.id);
        if (!restaurant) {
            return res.status(404).json({ message: "Restaurant not found" });
        }
        res.status(200).json(restaurant);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
});

router.put("/restaurants/:id", authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const { name, cuisine, location, rating } = req.body;

        // Find restaurant by ID
        const restaurant = await Restaurant.findById(id);

        if (!restaurant) {
            return res.status(404).json({ message: "Restaurant not found" });
        }

        // Check if the logged-in user is the owner of the restaurant
        if (restaurant.userId.toString() !== req.user.userId) {
            return res.status(403).json({ message: "You can only update your own restaurants" });
        }

        // Update restaurant
        restaurant.name = name || restaurant.name;
        restaurant.cuisine = cuisine || restaurant.cuisine;
        restaurant.location = location || restaurant.location;
        restaurant.rating = rating || restaurant.rating;

        const updatedRestaurant = await restaurant.save();

        res.status(200).json(updatedRestaurant);
    } catch (error) {
        console.error("Error updating restaurant:", error);
        res.status(500).json({ message: "Server Error" });
    }
});


router.delete("/restaurants/:id", authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;

        // Find restaurant by ID
        const restaurant = await Restaurant.findById(id);

        if (!restaurant) {
            return res.status(404).json({ message: "Restaurant not found" });
        }

        // Check if the logged-in user is the owner
        if (restaurant.userId.toString() !== req.user.userId) {
            return res.status(403).json({ message: "You can only delete your own restaurants" });
        }

        await restaurant.deleteOne();
        res.status(200).json({ message: "Restaurant deleted successfully" });
    } catch (error) {
        console.error("Error deleting restaurant:", error);
        res.status(500).json({ message: "Server Error" });
    }
});


module.exports = router;
