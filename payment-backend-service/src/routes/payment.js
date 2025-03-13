// src/routes/payment.js
const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController");

// GET all payments
router.get("/", paymentController.getAllPayments);

// GET single payment
router.get("/:id", paymentController.getPaymentById);

// POST create payment
router.post("/", paymentController.createPayment);

// PUT update payment status
router.put("/:id/status", paymentController.updatePaymentStatus);

module.exports = router;
