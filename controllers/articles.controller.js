const {
  fetchArticleByID,
  fetchAllArticles,
  fetchArticleComments,
  insertComment,
  updateVotes,
  insertArticle,
} = require("../models/articles.models");

exports.getArticleByID = (request, response, next) => {
  const { article_id } = request.params;
  fetchArticleByID(article_id)
    .then((article) => {
      response.status(200).send({ article });
    })
    .catch((err) => {
      next(err);
    });
};

exports.getArticles = (request, response, next) => {
  const { sort_by, order, topic, limit, p } = request.query;
  fetchAllArticles(sort_by, order, topic, limit, p)
    .then(({ articles }) => {
      response.status(200).send({ articles });
    })
    .catch((err) => {
      // console.log(err)
      next(err);
    });
};

exports.getArticleComments = (request, response, next) => {
  const { article_id } = request.params;
  fetchArticleComments(article_id)
    .then((article) => {
      response.status(200).send({ article });
    })
    .catch((err) => {
      next(err);
    });
};

exports.postArticleComment = (request, response, next) => {
  const { username, body } = request.body;
  const { article_id } = request.params;
  insertComment(username, body, article_id)
    .then((comment) => {
      response.status(201).send({ msg: comment });
    })
    .catch((err) => {
      next(err);
    });
};

exports.patchArticleVote = (request, response, next) => {
  const { article_id } = request.params;
  const { inc_votes } = request.body;
  updateVotes(article_id, inc_votes)
    .then((article) => {
      response.status(200).send({ article });
    })
    .catch((err) => {
      next(err);
    });
};

exports.postArticle = (request, response, next) => {
  const { author, title, body, topic, article_img_url } = request.body;
  insertArticle(author, title, body, topic, article_img_url)
    .then((article) => {
      response.status(201).send({ article });
    })
    .catch((err) => {
      next(err);
    });
};
