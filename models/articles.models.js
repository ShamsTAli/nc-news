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
