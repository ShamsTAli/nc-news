const { fetchUsers, fetchUsername } = require("../models/users.model");

exports.getUsers = (request, response, next) => {
  fetchUsers()
    .then((users) => {
      response.status(200).send({ users });
    })
    .catch((err) => {
      next(err);
    });
};

exports.getUsername = (request, response, next) => {
  const { username } = request.params;

  fetchUsername(username)
    .then((user) => {
      response.status(200).send({ user });
    })
    .catch((err) => {
      next(err);
    });
};
