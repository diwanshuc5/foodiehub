const mongoose = require("mongoose");

const restaurantSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    cuisine: {
        type: String,
        required: true,
    },
    location: {
        type: String,
        required: true,
    },
    rating: {
        type: Number,
        default: 0,
    },
    reviews: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Review",
        },
    ],
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true } // Associate with a user
});

module.exports = mongoose.model("Restaurant", restaurantSchema);
