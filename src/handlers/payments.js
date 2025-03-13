// src/handlers/payments.js
const { Pool } = require("pg");
let pool;

// Initialize database connection pool
const getDbPool = () => {
  if (!pool) {
    pool = new Pool({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      database: process.env.DB_NAME,
      user: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      ssl: {
        rejectUnauthorized: false,
      },
    });
  }
  return pool;
};

// Helper to parse path parameters
const getPathParameter = (event, param) => {
  return event.pathParameters && event.pathParameters[param];
};

// Get all payments
exports.getAll = async (event) => {
  try {
    const pool = getDbPool();
    const result = await pool.query("SELECT * FROM payments ORDER BY created_at DESC");

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(result.rows),
    };
  } catch (error) {
    console.error("Error getting payments:", error);

    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        error: "Internal Server Error",
        message: process.env.NODE_ENV === "development" ? error.message : undefined,
      }),
    };
  }
};

// Get payment by ID
exports.getById = async (event) => {
  try {
    const id = getPathParameter(event, "id");

    if (!id) {
      return {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ error: "Payment ID is required" }),
      };
    }

    const pool = getDbPool();
    const result = await pool.query("SELECT * FROM payments WHERE id = $1", [id]);

    if (result.rows.length === 0) {
      return {
        statusCode: 404,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ error: "Payment not found" }),
      };
    }

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(result.rows[0]),
    };
  } catch (error) {
    console.error(`Error getting payment ${event.pathParameters?.id}:`, error);

    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        error: "Internal Server Error",
        message: process.env.NODE_ENV === "development" ? error.message : undefined,
      }),
    };
  }
};

// Create payment
exports.create = async (event) => {
  try {
    let body;
    try {
      body = JSON.parse(event.body);
    } catch (e) {
      return {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ error: "Invalid request body" }),
      };
    }

    // Validate payment data
    if (!body.amount || !body.currency || !body.method) {
      return {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ error: "Amount, currency, and method are required" }),
      };
    }

    const pool = getDbPool();
    const result = await pool.query("INSERT INTO payments (amount, currency, method, status, metadata) VALUES ($1, $2, $3, $4, $5) RETURNING *", [
      body.amount,
      body.currency,
      body.method,
      "pending",
      body.metadata || {},
    ]);

    return {
      statusCode: 201,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(result.rows[0]),
    };
  } catch (error) {
    console.error("Error creating payment:", error);

    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        error: "Internal Server Error",
        message: process.env.NODE_ENV === "development" ? error.message : undefined,
      }),
    };
  }
};

// Update payment status
exports.updateStatus = async (event) => {
  try {
    const id = getPathParameter(event, "id");

    if (!id) {
      return {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ error: "Payment ID is required" }),
      };
    }

    let body;
    try {
      body = JSON.parse(event.body);
    } catch (e) {
      return {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ error: "Invalid request body" }),
      };
    }

    if (!body.status) {
      return {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ error: "Status is required" }),
      };
    }

    // Validate status
    const validStatuses = ["pending", "processing", "completed", "failed", "refunded"];
    if (!validStatuses.includes(body.status)) {
      return {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          error: "Invalid status",
          message: `Status must be one of: ${validStatuses.join(", ")}`,
        }),
      };
    }

    const pool = getDbPool();

    // Check if payment exists
    const checkResult = await pool.query("SELECT * FROM payments WHERE id = $1", [id]);
    if (checkResult.rows.length === 0) {
      return {
        statusCode: 404,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ error: "Payment not found" }),
      };
    }

    // Update payment status
    const result = await pool.query("UPDATE payments SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *", [body.status, id]);

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(result.rows[0]),
    };
  } catch (error) {
    console.error(`Error updating payment status for ${event.pathParameters?.id}:`, error);

    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        error: "Internal Server Error",
        message: process.env.NODE_ENV === "development" ? error.message : undefined,
      }),
    };
  }
};
