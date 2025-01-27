const express = require("express");
const { getEndpoints, getTopics } = require("../controllers/api.controller");
const app = express();

// Reminder to add express.us to access response body

// Get Requests
app.get("/api", getEndpoints);
app.get("/api/topics", getTopics);

// Error Handling
// Error 400
// app.use((err, request, response, next) => {
//   response
//     .status(400)
//     .send({msg: "Bad Request"})
//     .catch((err) => {
//       next(err);
//     });
// });

// Default 500 response
app.use((err, request, response, next) => {
  response
    .status(500)
    .send({ msg: "Sorry bud, internal server error, have a good day" });
});

module.exports = app;
