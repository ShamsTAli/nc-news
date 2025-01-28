const { checkArticleHasComments } = require("../util/checkArticleComment");
const {
  checkIfExists,
  checkArticleExists,
  checkValidDataType,
} = require("../util/checkIfExists");

const db = require(`${__dirname}/../db/connection.js`);

exports.fetchArticleByID = (article_id) => {
  return db
    .query("SELECT * FROM articles WHERE article_id = $1", [article_id])
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
};

exports.fetchAllArticles = () => {
  const inputQuery = `
  SELECT
    a.author,
    a.title,
    a.article_id,
    a.topic,
    a.created_at,
    a.votes,
    a.article_img_url,
    COUNT(c.comment_id) AS comment_count
FROM
    articles a
LEFT JOIN
    comments c
ON
    a.article_id = c.article_id
GROUP BY
    a.article_id
ORDER BY
    a.created_at DESC;
`;
  return db.query(inputQuery).then((result) => {
    return result.rows;
  });
};

exports.fetchArticleComments = (article_id) => {
  return checkArticleHasComments(article_id).then(() => {
    const inputQuery = `
       SELECT
      c.article_id,
      c.votes,
      c.created_at,
      c.author,
      c.body,
      c.comment_id
    FROM
      comments c
    WHERE
      c.article_id = $1
    ORDER BY
      c.created_at DESC
    `;
    return db.query(inputQuery, [article_id]).then(({ rows }) => {
      return rows;
    });
  });
};

exports.insertComment = (username, body, article_id) => {
  return checkIfExists(username, body).then(() => {
    return checkArticleExists(article_id)
      .then(() => {
        return db.query(
          "INSERT INTO comments (author, body, article_id) VALUES ($1, $2, $3) RETURNING *",
          [username, body, article_id]
        );
      })
      .then(({ rows }) => {
        return rows[0];
      });
  });
};

exports.updateVotes = (article_id, inc_votes) => {
  return checkArticleExists(article_id)
    .then(() => {
      return checkValidDataType(inc_votes);
    })
    .then(() => {
      return db.query("UPDATE articles SET votes = votes + $1 WHERE article_id = $2 RETURNING *", [
        inc_votes,
        article_id,
      ]);
    })
    // .then(() => {
    //   return db.query("SELECT * FROM articles WHERE article_id = $1", [
    //     article_id,
    //   ]);
    // })
    .then(({ rows }) => {
      return rows[0];
    });
};
