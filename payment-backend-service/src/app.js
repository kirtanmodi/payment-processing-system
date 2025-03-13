// src/app.js
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const paymentRoutes = require("./routes/payment");

// Initialize express app
const app = express();

// Middleware
app.use(helmet()); // Security headers
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Parse JSON bodies

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "UP", service: "Payment Processing Service" });
});

// Routes
app.use("/api/payments", paymentRoutes);

// Not found middleware
app.use((req, res, next) => {
  res.status(404).json({ error: "Route not found" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: "Internal Server Error",
    message: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

module.exports = app;
