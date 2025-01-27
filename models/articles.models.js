const db = require(`${__dirname}/../db/connection.js`);

exports.fetchArticleByID = (article_id) => {
  return db
    .query("SELECT * FROM articles WHERE article_id = $1", [article_id])
    .then((result) => {
      if (result.rows.length === 0) {
        return Promise.reject({ msg: "article does not exist" });
      } else {
        return result.rows[0];
      }
    });
};
