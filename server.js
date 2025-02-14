require("dotenv").config(); // Load environment variables
const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors()); // Enable CORS
app.use(express.json()); // Enable JSON request handling

app.get("/", (req, res) => {
    res.send("FoodieHub Server is Running...");
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
