const db = require(`${__dirname}/../db/connection.js`);

exports.checkArticleHasComments = (article_id) => {
  const inputQuery = `
 SELECT 
    a.article_id,
    CASE 
        WHEN COUNT(c.comment_id) > 0 THEN 'Has Comments'
        ELSE 'No Comments'
    END AS comment_status
FROM 
    articles a
LEFT JOIN 
    comments c
ON 
    a.article_id = c.article_id
WHERE 
    a.article_id = $1
GROUP BY 
    a.article_id;
 `;
  return db.query(inputQuery, [article_id]).then(({ rows }) => {
    if (rows.length === 0) {
      return Promise.reject({
        status: 404,
        msg: "Not Found",
      });
    } else {
      return "Has Comments";
    }
  });
};
