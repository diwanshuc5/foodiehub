const express = require("express");
const app = express();
const PORT = 5000;

// Test route
app.get("/", (req, res) => {
    res.send("FoodieHub Server is Running...");
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
