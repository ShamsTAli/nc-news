const { checkValidUsername } = require("../util/checkIfExists");

const db = require(`${__dirname}/../db/connection.js`);

exports.fetchUsers = () => {
  return db.query("SELECT * FROM users").then(({ rows }) => {
    return rows;
  });
};

exports.fetchUsername = (username) => {
  return checkValidUsername(username).then(() => {
    return db
      .query("SELECT * FROM users WHERE username = $1", [username])
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
