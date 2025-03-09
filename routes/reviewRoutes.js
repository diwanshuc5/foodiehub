const express = require("express");
const Review = require("../models/Review");
const Restaurant = require("../models/Restaurant");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Add a review
router.post("/:restaurantId", authMiddleware, async (req, res) => {
    try {
        const { rating, comment } = req.body;

        // Check if restaurant exists
        const restaurant = await Restaurant.findById(req.params.restaurantId);
        if (!restaurant) return res.status(404).json({ message: "Restaurant not found" });

        // Create new review
        const newReview = await Review.create({
            userId: req.user.userId,
            restaurantId: req.params.restaurantId,
            rating,
            comment
        });

        // Add review ID to restaurant
        restaurant.reviews.push(newReview._id);
        
        // Recalculate average rating
        const allReviews = await Review.find({ restaurantId: req.params.restaurantId });
        restaurant.rating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

        await restaurant.save();
        res.status(201).json({ message: "Review added successfully", review: newReview });

    } catch (error) {
        console.error("Error adding review:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// Get reviews for a restaurant
router.get("/:restaurantId", async (req, res) => {
    try {
        const reviews = await Review.find({ restaurantId: req.params.restaurantId }).populate("userId", "name email");
        res.status(200).json(reviews);
    } catch (error) {
        console.error("Error fetching reviews:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// Update a review
router.put("/:reviewId", authMiddleware, async (req, res) => {
    try {
        const { rating, comment } = req.body;
        const review = await Review.findById(req.params.reviewId);

        if (!review || review.userId.toString() !== req.user.userId) {
            return res.status(403).json({ message: "Not authorized to edit this review" });
        }

        if (rating) review.rating = rating;
        if (comment) review.comment = comment;

        await review.save();
        
        // Recalculate average rating
        const allReviews = await Review.find({ restaurantId: review.restaurantId });
        const restaurant = await Restaurant.findById(review.restaurantId);
        restaurant.rating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
        await restaurant.save();
        
        res.status(200).json({ message: "Review updated successfully", review });

    } catch (error) {
        console.error("Error updating review:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// Delete a review
router.delete("/:reviewId", authMiddleware, async (req, res) => {
    try {
        const review = await Review.findById(req.params.reviewId);
        if (!review || review.userId.toString() !== req.user.userId) {
            return res.status(403).json({ message: "Not authorized to delete this review" });
        }

        await review.deleteOne();

        // Remove reference from restaurant
        await Restaurant.findByIdAndUpdate(review.restaurantId, { $pull: { reviews: review._id } });

        res.status(200).json({ message: "Review deleted successfully" });

    } catch (error) {
        console.error("Error deleting review:", error);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
