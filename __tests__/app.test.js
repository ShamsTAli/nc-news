const endpointsJson = require("../endpoints.json");
const request = require("supertest");
const app = require("../app/app");
// Require statements for beforeEach and AfterAll functions
const db = require("../db/connection");
const seed = require("../db/seeds/seed");
const testData = require("../db/data/test-data/index");
/* Set up your beforeEach & afterAll functions here */
beforeEach(() => seed(testData));
afterAll(() => db.end());

describe("GET /api", () => {
  test("200: Responds with an object detailing the documentation for each endpoint", () => {
    return request(app)
      .get("/api")
      .expect(200)
      .then(({ body: { endpoints } }) => {
        expect(endpoints).toEqual(endpointsJson);
      });
  });
});
