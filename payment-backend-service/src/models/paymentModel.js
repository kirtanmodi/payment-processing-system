// src/models/paymentModel.js
const db = require("../../config/database");

class Payment {
  static async createPayment(paymentData) {
    const { amount, currency, description, customerId } = paymentData;

    try {
      const result = await db.query(
        "INSERT INTO payments (amount, currency, description, customer_id, status, created_at) VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING *",
        [amount, currency, description, customerId, "PENDING"]
      );
      return result.rows[0];
    } catch (error) {
      console.error("Error creating payment:", error);
      throw error;
    }
  }

  static async getPaymentById(id) {
    try {
      const result = await db.query("SELECT * FROM payments WHERE id = $1", [id]);
      return result.rows[0];
    } catch (error) {
      console.error("Error fetching payment:", error);
      throw error;
    }
  }

  static async getAllPayments() {
    try {
      const result = await db.query("SELECT * FROM payments ORDER BY created_at DESC");
      return result.rows;
    } catch (error) {
      console.error("Error fetching payments:", error);
      throw error;
    }
  }

  static async updatePaymentStatus(id, status) {
    try {
      const result = await db.query("UPDATE payments SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *", [status, id]);
      return result.rows[0];
    } catch (error) {
      console.error("Error updating payment status:", error);
      throw error;
    }
  }
}

module.exports = Payment;
