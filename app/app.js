const express = require("express");
const { getEndpoints } = require("../controllers/api.controller");
const app = express();

// Reminder to add express.us to access response body

// Get Requests
app.get("/api", getEndpoints);

// Error Handling
app.use((err, request, response, next) => {
  response.status(500).send(err);
});

module.exports = app;
