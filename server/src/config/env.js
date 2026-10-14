const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });

module.exports = {
  port: process.env.PORT && process.env.PORT !== '0' ? parseInt(process.env.PORT, 10) : 5001,
  mongoUri: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET,
  mlServiceUrl: process.env.ML_SERVICE_URL || "http://localhost:8000",
};
