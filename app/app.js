const express = require("express");
const { getEndpoints, getTopics } = require("../controllers/api.controller");
const {
  getArticleByID,
  getArticles,
  getArticleComments,
  postArticleComment,
  patchArticleVote,
} = require("../controllers/articles.controller");
const { deleteComment } = require("../controllers/comments.controller");
const { getUsers } = require("../controllers/users.controller");
const app = express();
app.use(express.json());

// Get Requests
app.get("/api", getEndpoints);
app.get("/api/topics", getTopics);
app.get("/api/articles/:article_id", getArticleByID);
app.get("/api/articles", getArticles); // includes queries (sortby, order, topic)
app.get("/api/articles/:article_id/comments", getArticleComments);
app.get("/api/users", getUsers)

//Post & Patch & Delete Requests
app.post("/api/articles/:article_id/comments", postArticleComment);
app.patch("/api/articles/:article_id", patchArticleVote);
app.delete("/api/comments/:comment_id", deleteComment)


// Error Handling
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
  if (err.msg && err.status) {
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
