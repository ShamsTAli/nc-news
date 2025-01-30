const {
  deleteCommentByID,
  updateCommentVotes,
} = require("../models/comments.model");

exports.deleteComment = (request, response, next) => {
  const { comment_id } = request.params;
  deleteCommentByID(comment_id)
    .then(() => {
      response.status(204).send();
    })
    .catch((err) => {
      next(err);
    });
};

exports.patchCommentVotes = (request, response, next) => {
  const { comment_id } = request.params;
  const { inc_votes } = request.body;
  updateCommentVotes(comment_id, inc_votes)
    .then((comment) => {
      response.status(200).send({ comment });
    })
    .catch((err) => {
      next(err);
    });
};
