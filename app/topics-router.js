const { getTopics, postTopic } = require("../controllers/apitopics.controller");

const topicsRouter = require("express").Router();

topicsRouter.route("/")
.get(getTopics)
.post(postTopic)

module.exports = topicsRouter;
