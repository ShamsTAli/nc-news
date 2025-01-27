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

describe("GET /api/topics", () => {
  test("200: Responds with data greater than 1", () => {
    return request(app)
      .get("/api/topics")
      .expect(200)
      .then(({ body }) => {
        expect(body.topics.length).toBeGreaterThan(1);
        expect(body.topics.length).toBe(3);
      });
  });
  test("200: Responds with an object that matches expected data type", () => {
    return request(app)
      .get("/api/topics")
      .expect(200)
      .then(({ body }) => {
        body.topics.forEach((element) => {
          expect(element).toHaveProperty("description", expect.any(String));
          expect(element).toHaveProperty("slug", expect.any(String));
        });
      });
  });
  test("404: Responds with Not Found if URL is incorrect", () => {
    return request(app).get("/api/topic").expect(404);
  });
});

describe.skip("GET /api/articles/:article_id", () => {
  test("GET 200: Responds with a single article", () => {
    return request(app).get("/api/articles/1").send(200);
  });
  test("GET 400: Responds with an appropriate err message when provided an invalid request", () => {
    return request(app).get("/api/articles/name-of-article").send(400);
  });
  test("GET 404: Responds with an appropriate err message when ID does not exist", () => {
    return request(app).get("/api/articles/99").send(404);
  });
});
