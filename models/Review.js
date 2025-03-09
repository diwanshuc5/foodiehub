const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: "Restaurant", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String },
}, { timestamps: true });

const Review = mongoose.model("Review", reviewSchema);
module.exports = Review;
// In the Review model, we define a schema with the following fields:
// userId: The ID of the user who posted the review. This field is required.
// restaurantId: The ID of the restaurant being reviewed. This field is required.
// rating: The rating given by the user, ranging from 1 to 5. This field is required.
// comment: An optional comment provided by the user.
// timestamps: true: Automatically add createdAt and updatedAt fields to the document.