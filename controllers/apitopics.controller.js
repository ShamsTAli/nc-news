const {
  fetchEndpoints,
  selectTopics,
  updateTopic,
} = require("../models/apitopic.model");

exports.getEndpoints = (request, response, next) => {
  fetchEndpoints()
    .then((endpoints) => {
      response.status(200).send({ endpoints });
    })
    .catch((err) => {
      next(err);
    });
};

exports.getTopics = (request, response, next) => {
  selectTopics()
    .then((topics) => {
      response.status(200).send({ topics });
    })
    .catch((err) => {
      next(err);
    });
};

exports.postTopic = (request, response, next) => {
  const { slug, description } = request.body;
  updateTopic(slug, description)
    .then((topic) => {
      response.status(201).send({ topic });
    })
    .catch((err) => {
      next(err);
    });
};
