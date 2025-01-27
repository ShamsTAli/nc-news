const fs = require("fs/promises");
const db = require(`${__dirname}/../db/connection.js`);

async function fetchEndpoints() {
  try {
    const data = await fs.readFile(`${__dirname}/../endpoints.json`, "utf-8");
    return JSON.parse(data);
  } catch (err) {
    return err;
  }
}

async function selectTopics() {
  try {
    const allTopics = await db.query("SELECT * FROM topics");
    return allTopics.rows;
  } catch (err) {
    return err;
  }
}

module.exports = {
  fetchEndpoints,
  selectTopics,
};
