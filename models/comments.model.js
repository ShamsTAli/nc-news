const { checkValidCommentID } = require("../util/checkIfExists");

const db = require(`${__dirname}/../db/connection.js`);

exports.deleteCommentByID = (comment_id) => {
  return checkValidCommentID(comment_id).then(() => {
    const inputQuery = "DELETE FROM comments WHERE comment_id = $1 RETURNING *";
    return db.query(inputQuery, [comment_id]).then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({
          status: 404,
          msg: "Not Found",
        });
      } else {
        return Promise.resolve();
      }
    });
  });
};

exports.updateCommentVotes = (comment_id, inc_votes) => {
  return checkValidCommentID(comment_id).then(() => {
    return db
      .query(
        "UPDATE comments SET votes = votes + $1 WHERE comment_id = $2 RETURNING *",
        [inc_votes, comment_id]
      )
      .then((result) => {
        if (result.rows.length === 0) {
          return Promise.reject({
            status: 404,
            msg: "Not Found",
          });
        } else {
          return result.rows[0];
        }
      });
  });
};
