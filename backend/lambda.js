const serverless = require("serverless-http");
const app = require("./app");

// Export Lambda handler wrapping the full Express REST API
exports.handler = serverless(app);
