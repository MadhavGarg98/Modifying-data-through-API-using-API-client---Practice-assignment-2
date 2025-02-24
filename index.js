require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.error("MongoDB connection error:", err));

// MenuItem Schema
const menuItemSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true }
});

const MenuItem = mongoose.model("MenuItem", menuItemSchema);

// Routes

// Add a menu item (POST)
app.post("/menu", async (req, res) => {
    try {
        const { name, description, price } = req.body;
        if (!name || !price) {
            return res.status(400).json({ error: "Name and price are required." });
        }
        const newItem = new MenuItem({ name, description, price });
        await newItem.save();
        res.status(201).json({ message: "Menu item added", item: newItem });
    } catch (error) {
        res.status(500).json({ error: "Error adding menu item" });
    }
});

// Fetch all menu items (GET)
app.get("/menu", async (req, res) => {
    try {
        const menuItems = await MenuItem.find();
        res.status(200).json(menuItems);
    } catch (error) {
        res.status(500).json({ error: "Error fetching menu items" });
    }
});

// Update a menu item (PUT)
app.put("/menu/:id", async (req, res) => {
    try {
        const { name, description, price } = req.body;
        const updatedItem = await MenuItem.findByIdAndUpdate(
            req.params.id,
            { name, description, price },
            { new: true, runValidators: true }
        );

        if (!updatedItem) {
            return res.status(404).json({ error: "Menu item not found." });
        }

        res.status(200).json({ message: "Menu item updated", item: updatedItem });
    } catch (error) {
        res.status(500).json({ error: "Error updating menu item" });
    }
});

// Delete a menu item (DELETE)
app.delete("/menu/:id", async (req, res) => {
    try {
        const deletedItem = await MenuItem.findByIdAndDelete(req.params.id);

        if (!deletedItem) {
            return res.status(404).json({ error: "Menu item not found." });
        }

        res.status(200).json({ message: "Menu item deleted", item: deletedItem });
    } catch (error) {
        res.status(500).json({ error: "Error deleting menu item" });
    }
});

// Start server
app.listen(PORT, () => console.log(`Server running on port http://localhost:${PORT}`));
