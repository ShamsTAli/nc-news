const {
  fetchArticleByID,
  fetchAllArticles,
  fetchArticleComments,
  insertComment,
  updateVotes,
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
  fetchAllArticles()
    .then((articles) => {
      response.status(200).send({ articles });
    })
    .catch((err) => {
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
  const {article_id} = request.params
  insertComment(username, body, article_id)
    .then((comment) => {
      response.status(201).send({ msg: comment });
    })
    .catch((err) => {
      next(err);
    });
};

exports.patchArticleVote = (request, response, next) =>{
  const {article_id} = request.params
  const {inc_votes} = request.body
  updateVotes(article_id, inc_votes)
  .then((article)=>{
    response.status(200).send({article})
  })
  .catch((err)=>{
    next(err)
  })

}
