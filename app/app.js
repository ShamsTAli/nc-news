const express = require("express");
const { getEndpoints, getTopics } = require("../controllers/api.controller");
const { getArticleByID } = require("../controllers/articles.controller");
const app = express();

// Reminder to add express.us to access response body

// Get Requests
app.get("/api", getEndpoints);
app.get("/api/topics", getTopics);
app.get("/api/articles/:article_id", getArticleByID);

// Error Handling

// Custom 404
app.all("*", (request, response) => {
  response.status(404).send({ error: "Endpoint not found" });
});

// Error 400
app.use((err, request, response, next) => {
  if (err.code === "22P02") {
    response.status(400).send({ msg: "Bad Request" });
  } else {
    next(err);
  }
});

app.use((err, request, response, next) => {
  if (err.msg === "article does not exist") {
    response.status(404).send({msg: "Not Found"});
  } else {
    next(err);
  }
});

// Default 500 response
app.use((err, request, response, next) => {
  response
    .status(500)
    .send({ msg: "Sorry bud, internal server error, have a good day" });
});

module.exports = app;
