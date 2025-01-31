const express = require("express");
const { getEndpoints } = require("../controllers/apitopics.controller");

const apiRouter = require("express").Router();
const articlesRouter = require("./articles-router");
const usersRouter = require("./users-router");
const topicsRouter = require("./topics-router");
const commentsRouter = require("./comments-router");
const app = express();

app.use(express.json());
app.use("/api", apiRouter);
apiRouter.use("/articles", articlesRouter);
apiRouter.use("/users", usersRouter);
apiRouter.use("/topics", topicsRouter);
apiRouter.use("/comments", commentsRouter);

app.get("/api", getEndpoints);

app.all("*", (request, response) => {
  response.status(404).send({ error: "Endpoint not found" });
});
app.use((err, request, response, next) => {
  if (err.code === "22P02" || err.msg === "Bad Request") {
    response.status(400).send({ msg: "Bad Request" });
  } else {
    next(err);
  }
});
app.use((err, request, response, next) => {
  if (err.status === 409) {
    response.status(409).send({ error: err.msg });
  } else {
    next(err);
  }
});

app.use((err, request, response, next) => {
  if (err.status === 404) {
    response.status(404).send({ msg: "Not Found" });
  } else {
    next(err);
  }
});
app.use((err, request, response, next) => {
  response
    .status(500)
    .send({ msg: "Sorry bud, internal server error, have a good day" });
});

module.exports = app;
