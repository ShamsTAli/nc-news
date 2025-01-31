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

async function updateTopic(slug, description) {
  try {
    if (
      !slug ||
      !description ||
      typeof slug !== "string" ||
      typeof description !== "string"
    ) {
      throw {
        status: 400,
        msg: "Bad Request",
      };
    }
    await validateTopic(slug);
    const result = await db.query(
      "INSERT INTO topics (slug, description) VALUES ($1, $2) RETURNING *",
      [slug, description]
    );
    return result.rows[0];
  } catch (err) {
    throw err;
  }
}

async function validateTopic(slug) {
  try {
    const result = await db.query("SELECT * FROM topics WHERE slug = $1", [
      slug,
    ]);
    if (result.rows.length > 0) {
      throw {
        status: 409,
        msg: "Conflict: Topic already exists",
      };
    }
  } catch (err) {
    throw {
      status: 409,
      msg: "Conflict: Topic already exists",
    };
  }
}

module.exports = {
  fetchEndpoints,
  selectTopics,
  updateTopic,
};
