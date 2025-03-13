// src/handlers/health.js
exports.handler = async (event) => {
  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      status: "UP",
      service: "Payment Processing Service",
      timestamp: new Date().toISOString(),
    }),
  };
};
