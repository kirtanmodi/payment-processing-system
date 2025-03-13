// src/controllers/paymentController.js
const Payment = require("../models/paymentModel");

// Get all payments
exports.getAllPayments = async (req, res, next) => {
  try {
    const payments = await Payment.getAllPayments();
    res.status(200).json({ success: true, data: payments });
  } catch (error) {
    next(error);
  }
};

// Get single payment
exports.getPaymentById = async (req, res, next) => {
  try {
    const payment = await Payment.getPaymentById(req.params.id);

    if (!payment) {
      return res.status(404).json({ success: false, error: "Payment not found" });
    }

    res.status(200).json({ success: true, data: payment });
  } catch (error) {
    next(error);
  }
};

// Create new payment
exports.createPayment = async (req, res, next) => {
  try {
    const { amount, currency, description, customerId } = req.body;

    if (!amount || !currency || !customerId) {
      return res.status(400).json({
        success: false,
        error: "Please provide amount, currency, and customerId",
      });
    }

    const payment = await Payment.createPayment({
      amount,
      currency,
      description,
      customerId,
    });

    res.status(201).json({ success: true, data: payment });
  } catch (error) {
    next(error);
  }
};

// Update payment status
exports.updatePaymentStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ success: false, error: "Please provide status" });
    }

    const payment = await Payment.updatePaymentStatus(req.params.id, status);

    if (!payment) {
      return res.status(404).json({ success: false, error: "Payment not found" });
    }

    res.status(200).json({ success: true, data: payment });
  } catch (error) {
    next(error);
  }
};
