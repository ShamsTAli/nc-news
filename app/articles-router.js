const {
  getArticles,
  getArticleByID,
  patchArticleVote,
  getArticleComments,
  postArticleComment,
} = require("../controllers/articles.controller");

const articlesRouter = require("express").Router();

articlesRouter.route("/").get(getArticles);

articlesRouter
  .route("/:article_id")
  .get(getArticleByID)
  .patch(patchArticleVote);

articlesRouter
  .route("/:article_id/comments")
  .get(getArticleComments)
  .post(postArticleComment);

module.exports = articlesRouter;
