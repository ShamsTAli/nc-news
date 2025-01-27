const fs = require("fs/promises");

async function fetchEndpoints() {
  try {
    const data = await fs.readFile(`${__dirname}/../endpoints.json`, "utf-8");
    return JSON.parse(data);
  } catch (err) {
    return err;
  }
}

module.exports = {
  fetchEndpoints,
};
