const { checkArticleHasComments } = require("../util/checkArticleComment");
const {
  checkIfExists,
  checkArticleExists,
  checkValidDataType,
  checkValidTopic,
  insertTopic,
  insertAuthor,
} = require("../util/checkIfExists");

const db = require(`${__dirname}/../db/connection.js`);

exports.fetchArticleByID = (article_id) => {
  return db
    .query(
      `
  SELECT
    a.author,
    a.title,
    a.article_id,
    a.topic,
    a.created_at,
    a.votes,
    a.article_img_url,
    a.body,
    COUNT(c.comment_id)::INT AS comment_count
  FROM
    articles a
  LEFT JOIN
    comments c
  ON
    a.article_id = c.article_id
  WHERE a.article_id = $1
  GROUP BY a.article_id`,
      [article_id]
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
};

exports.fetchAllArticles = (
  sort_by = "created_at",
  order = "DESC",
  topic,
  limit = 10,
  p = 1
) => {
  const validSortQuery = [
    "author",
    "title",
    "article_id",
    "topic",
    "created_at",
    "votes",
    "comment_count",
  ];
  const validOrderQuery = ["DESC", "ASC"];
  const formattedOrder = order.toUpperCase();
  const formatP = Number(p);
  const formatLimit = Number(limit);

  if (
    !validSortQuery.includes(sort_by) ||
    !validOrderQuery.includes(formattedOrder)
  ) {
    return Promise.reject({
      status: 404,
      msg: "Not Found",
    });
  }

  if (formatLimit < 1 || formatP < 1) {
    return Promise.reject({
      status: 400,
      msg: "Bad Request",
    });
  }

  const offset = (p - 1) * limit; // page 1 means we start from 0, page 2 means we start from 10

  let SQLbaseQuery = `
  SELECT
    a.author,
    a.title,
    a.article_id,
    a.topic,
    a.created_at,
    a.votes,
    a.article_img_url,
    COUNT(c.comment_id)::INT AS comment_count,
    COUNT (*) OVER()::INT AS total_count
  FROM
    articles a
  LEFT JOIN
    comments c
  ON
    a.article_id = c.article_id`;

  const args = [];
  let topicPromise = Promise.resolve();

  if (topic) {
    topicPromise = checkValidTopic(topic).then(() => {
      SQLbaseQuery += " WHERE topic = $1";
      args.push(topic);
    });
  }

  return topicPromise.then(() => {
    SQLbaseQuery += " GROUP BY a.article_id";
    SQLbaseQuery += ` ORDER BY
    a.${sort_by} ${formattedOrder}`;
    SQLbaseQuery += ` LIMIT $${args.length + 1} OFFSET $${args.length + 2}`;

    args.push(limit, offset);

    return db.query(SQLbaseQuery, args).then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({
          status: 404,
          msg: "Not Found",
        });
      }
      return {
        articles: rows,
        total_count: rows[0]?.total_count || 0,
      };
    });
  });
};

exports.fetchArticleComments = (article_id, limit = 10, p = 1) => {
  return checkArticleHasComments(article_id).then(() => {
    const formatP = Number(p);
    const formatLimit = Number(limit);
    if (formatLimit < 1 || formatP < 1) {
      return Promise.reject({
        status: 400,
        msg: "Bad Request",
      });
    }
    const offset = (formatP - 1) * formatLimit;
    const inputQuery = `
    SELECT
      c.article_id,
      c.votes,
      c.created_at,
      c.author,
      c.body,
      c.comment_id,
      COUNT(*) OVER() AS total_count
    FROM
      comments c
    WHERE
      c.article_id = $1
    ORDER BY
      c.created_at DESC
    LIMIT $2 OFFSET $3
    `;
    return db
      .query(inputQuery, [article_id, formatLimit, offset])
      .then(({ rows }) => {
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
      return db.query(
        "UPDATE articles SET votes = votes + $1 WHERE article_id = $2 RETURNING *",
        [inc_votes, article_id]
      );
    })
    .then(({ rows }) => {
      return rows[0];
    });
};

exports.insertArticle = (
  author,
  title,
  body,
  topic,
  article_img_url = "https://images.pexels.com/photos/97050/pexels-photo-97050.jpeg?w=700&h=700"
) => {
  if (!author || !title || !body || !topic) {
    return Promise.reject({
      status: 400,
      msg: "Bad Request",
    });
  }
  return insertTopic(topic).then(() => {
    return insertAuthor(author).then(() => {
      return db
        .query(
          "INSERT INTO articles (author, title, body, topic, article_img_url) VALUES ($1, $2, $3, $4, $5) RETURNING *",
          [author, title, body, topic, article_img_url]
        )
        .then(({ rows }) => {
          return rows[0];
        });
    });
  });
};

exports.deleteArticleByID = async (article_id) => {
  try {
    await db.query("BEGIN;");
    await db.query("DELETE FROM comments WHERE article_id = $1 RETURNING *;", [
      article_id,
    ]);
    const result = await db.query(
      "DELETE FROM articles WHERE article_id = $1 RETURNING *;",
      [article_id]
    );
    if (result.rows.length === 0) {
      await db.query("ROLLBACK");
      return Promise.reject({
        status: 404,
        msg: "Not Found",
      });
    }
    await db.query("COMMIT;");
    return Promise.resolve(result);
  } catch (error) {
    await db.query("ROLLBACK");
    throw error;
  }
};
