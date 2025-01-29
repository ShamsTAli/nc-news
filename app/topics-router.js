const { getTopics } = require("../controllers/apitopics.controller");

const topicsRouter = require("express").Router();

topicsRouter.route("/").get(getTopics);

module.exports = topicsRouter;
