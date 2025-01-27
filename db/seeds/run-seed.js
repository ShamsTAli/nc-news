const devData = require('../data/development-data/index.js');
const testData = require("../data/test-data/index.js")
const seed = require('./seed.js');
const db = require('../connection.js');
const data = process.env.NODE_ENV === "test" ? testData : devData

const runSeed = () => {
  return seed(data).then(() => db.end());
};

runSeed();
