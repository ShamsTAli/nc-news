const db = require(`${__dirname}/../db/connection.js`);

exports.fetchUsers = () => {
  return db.query("SELECT * FROM users").then(({ rows }) => {
    return rows;
  });
};
