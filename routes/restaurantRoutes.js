const express = require("express");
const Restaurant = require("../models/Restaurant");
const router = express.Router();

// Create a new restaurant
router.post("/restaurants", async (req, res) => {
    const { name, cuisine, location, rating } = req.body;

    try {
        const newRestaurant = new Restaurant({
            name,
            cuisine,
            location,
            rating,
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
    try {
        const restaurants = await Restaurant.find();
        res.status(200).json(restaurants);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
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

router.put("/restaurants/:id", async (req, res) => {
    try {
        const { name, cuisine, location, rating } = req.body;

        const updatedRestaurant = await Restaurant.findByIdAndUpdate(
            req.params.id,
            { name, cuisine, location, rating },
            { new: true, runValidators: true } // Returns the updated record
        );

        if (!updatedRestaurant) {
            return res.status(404).json({ message: "Restaurant not found" });
        }

        res.status(200).json(updatedRestaurant);
    } catch (error) {
        console.error("Error updating restaurant:", error);
        res.status(500).json({ message: "Server Error" });
    }
});

router.delete("/restaurants/:id", async (req, res) => {
    try {
        const deletedRestaurant = await Restaurant.findByIdAndDelete(req.params.id);

        if (!deletedRestaurant) {
            return res.status(404).json({ message: "Restaurant not found" });
        }

        res.status(200).json({ message: "Restaurant deleted successfully" });
    } catch (error) {
        console.error("Error deleting restaurant:", error);
        res.status(500).json({ message: "Server Error" });
    }
});

module.exports = router;
