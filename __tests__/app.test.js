const endpointsJson = require("../endpoints.json");
const request = require("supertest");
const app = require("../app/app");
// Require statements for beforeEach and AfterAll functions
const db = require("../db/connection");
const seed = require("../db/seeds/seed");
const testData = require("../db/data/test-data/index");
const e = require("express");
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
    return request(app)
      .get("/api/topic")
      .expect(404)
      .then(({ body }) => {
        expect(body.error).toBe("Endpoint not found");
      });
  });
});

describe("GET /api/articles/:article_id", () => {
  test("GET 200: Responds with a single article", () => {
    return request(app)
      .get("/api/articles/1")
      .expect(200)
      .then(({ body }) => {
        expect(body.article).toHaveProperty("article_id", expect.any(Number));
        expect(body.article).toHaveProperty("title", expect.any(String));
        expect(body.article).toHaveProperty("topic", expect.any(String));
        expect(body.article).toHaveProperty("author", expect.any(String));
        expect(body.article).toHaveProperty("body", expect.any(String));
        expect(body.article).toHaveProperty("created_at");
        expect(body.article).toHaveProperty("votes", expect.any(Number));
        expect(body.article).toHaveProperty(
          "article_img_url",
          expect.any(String)
        );
      });
  });
  test("GET 400: Responds with an appropriate err message when provided an invalid request", () => {
    return request(app)
      .get("/api/articles/name-of-article")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad Request");
      });
  });
  test("GET 404: Responds with an appropriate err message when ID does not exist", () => {
    return request(app)
      .get("/api/articles/99")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Not Found");
      });
  });
});

describe("GET /api/articles", () => {
  test("GET 200: Responds with all articles", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body }) => {
        expect(body.articles.length).toBe(13);
      });
  });
  test("GET 200: Responds with comment count as an additional property", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body }) => {
        body.articles.forEach((element) => {
          expect(element).toHaveProperty("comment_count", expect.any(Number));
        });
      });
  });
  test("GET 200: Responds with articles in descending order", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body }) => {
        expect(body.articles).toBeSortedBy("created_at", {
          descending: "true",
          coerce: true,
        });
      });
  });
});

describe("GET /api/articles/:article_id/comments", () => {
  test("GET 200: Responds with expected properties in single comment object", () => {
    return request(app)
      .get("/api/articles/1/comments")
      .expect(200)
      .then(({ body }) => {
        body.article.forEach((element) => {
          expect(element).toHaveProperty("comment_id", expect.any(Number));
          expect(element).toHaveProperty("votes", expect.any(Number));
          expect(element).toHaveProperty("created_at");
          expect(element).toHaveProperty("author", expect.any(String));
          expect(element).toHaveProperty("body", expect.any(String));
          expect(element).toHaveProperty("article_id", expect.any(Number));
        });
      });
  });
  test("GET 200: Responds with article comments sorted, most recent first", () => {
    return request(app)
      .get("/api/articles/1/comments")
      .expect(200)
      .then(({ body }) => {
        expect(body.article).toBeSortedBy("created_at", {
          descending: "true",
        });
      });
  });
  test("GET 200: Responds an empty array if the article has no comments", () => {
    return request(app)
      .get("/api/articles/2/comments")
      .expect(200)
      .then(({ body }) => {
        expect(body.article.length).toBe(0);
        expect(Array.isArray(body.article)).toBe(true);
      });
  });
  test("GET 400: Responds bad request if invalid article ID", () => {
    return request(app)
      .get("/api/articles/subjectarticle/comments")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad Request");
      });
  });
  test("GET 404: Responds not found if no article exists", () => {
    return request(app)
      .get("/api/articles/20/comments")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Not Found");
      });
  });
});

describe("POST /api/articles/:article_id/comments", () => {
  test("POST:201 Responds with post object on successful post request", () => {
    const postComment = {
      username: "icellusedkars",
      body: "This article is very informative...",
    };
    return request(app)
      .post("/api/articles/2/comments")
      .send(postComment)
      .expect(201)
      .then(({ body }) => {
        expect(body.msg).toMatchObject({
          article_id: 2,
          author: "icellusedkars",
          body: "This article is very informative...",
          comment_id: expect.any(Number),
          created_at: expect.any(String),
          votes: expect.any(Number),
        });
      });
  });
  test("POST:404 Responds with not found if article_id does not exist", () => {
    const postComment = {
      username: "shamscript",
      body: "This article is very informative...",
    };
    return request(app)
      .post("/api/articles/200/comments")
      .send(postComment)
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toEqual("Not Found");
      });
  });
  test("POST:400 Responds with err and msg if post is missing data", () => {
    const postComment = {
      username: "shamscript",
    };
    return request(app)
      .post("/api/articles/2/comments")
      .send(postComment)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad Request");
      });
  });
  test("POST:400 Responds with err and msg if post post includes incorrect keys", () => {
    const postComment = {
      username: "shamscript",
      votes: "This article is very informative...",
    };
    return request(app)
      .post("/api/articles/2/comments")
      .send(postComment)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad Request");
      });
  });
});

describe("PATCH /api/articles/:article_id", () => {
  test("PATCH 200: Accepted patch request with positive number", () => {
    const patchRequest = {
      inc_votes: 1,
    };
    return request(app)
      .patch("/api/articles/5")
      .send(patchRequest)
      .expect(200)
      .then(({ body }) => {
        expect(body.article).toMatchObject({
          article_id: 5,
          title: "UNCOVERED: catspiracy to bring down democracy",
          topic: "cats",
          author: "rogersop",
          body: "Bastet walks amongst us, and the cats are taking arms!",
          created_at: "2020-08-03T13:14:00.000Z",
          votes: 1,
          article_img_url:
            "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
        });
      });
  });
  test("PATCH 200: Test if increments", () => {
    const patchRequest = {
      inc_votes: 1,
    };
    return request(app)
      .patch("/api/articles/5")
      .send(patchRequest)
      .expect(200)
      .then(({ body }) => {
        expect(body.article.votes).toBe(1);
        return request(app)
          .patch("/api/articles/5")
          .send(patchRequest)
          .expect(200);
      })
      .then(({ body }) => {
        expect(body.article.votes).toBe(2);
      });
  });
  test("PATCH 200: Accepted patch request with negative number", () => {
    const patchRequest = {
      inc_votes: -100,
    };
    return request(app)
      .patch("/api/articles/5")
      .send(patchRequest)
      .expect(200)
      .then(({ body }) => {
        expect(body.article).toMatchObject({
          article_id: 5,
          title: "UNCOVERED: catspiracy to bring down democracy",
          topic: "cats",
          author: "rogersop",
          body: "Bastet walks amongst us, and the cats are taking arms!",
          created_at: "2020-08-03T13:14:00.000Z",
          votes: -100,
          article_img_url:
            "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
        });
      });
  });
  test("PATCH 400: Bad request if invalid data", () => {
    const patchRequest = {
      inc_votes: "one",
    };
    return request(app)
      .patch("/api/articles/5")
      .send(patchRequest)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad Request");
      });
  });
  test("PATCH 404: ArticleID not found", () => {
    const patchRequest = {
      inc_votes: 1,
    };
    return request(app)
      .patch("/api/articles/25")
      .send(patchRequest)
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Not Found");
      });
  });
});

describe("DELETE /api/comments/:comment_id", () => {
  test("DELETE 204: Deletes item and no response sent back", () => {
    return request(app).delete("/api/comments/1").expect(204);
  });
  test("DELETE 404: Comment not found if non-existent comment_id", () => {
    return request(app)
      .delete("/api/comments/100")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Not Found");
      });
  });
  test("DELETE 400: Bad request if invalid data", () => {
    return request(app)
      .delete("/api/comments/negativecomment")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad Request");
      });
  });
});

describe("GET /api/users", () => {
  test("GET 200: Responds with all users in an array of objects with correct properties", () => {
    return request(app)
      .get("/api/users")
      .expect(200)
      .then(({ body }) => {
        expect(Array.isArray(body.users)).toBe(true);
        expect(body.users.length).toBe(4);
        body.users.forEach((element) => {
          expect(element).toMatchObject({
            username: expect.any(String),
            name: expect.any(String),
            avatar_url: expect.any(String),
          });
        });
      });
  });
  // Tried to simulate an empty database but couldn't get it to work
  // test("GET 200: Responds with empty array if the request is successful however there are no users", () => {
  //   return db.query("DELETE FROM users").then(() => {
  //     return request(app)
  //       .get("/api/users")
  //       .expect(200)
  //       .then(({ body }) => {
  //         expect(body.users).toEqual([]);
  //       });
  //   });
  // });
  test("GET 404: Responds with endpoint error if url is incorrect", () => {
    return request(app)
      .get("/api/user")
      .expect(404)
      .then(({ body }) => {
        expect(body.error).toBe("Endpoint not found");
      });
  });
});

describe("GET /api/articles (sorting queries)", () => {
  test("GET 200: Sorted by default settings for column (created_at) and order method (DESC)", () => {
    return request(app)
      .get("/api/articles?")
      .expect(200)
      .then(({ body }) => {
        expect(body.articles).toBeSorted({
          key: "created_at",
          descending: true,
        });
      });
  });
  test("GET 200: Sorted by a selected column and default order", () => {
    return request(app)
      .get("/api/articles?sort_by=votes")
      .expect(200)
      .then(({ body }) => {
        expect(body.articles).toBeSorted({ key: "votes", descending: true });
      });
  });
  test("GET 200: Sorted by a selected column and ASC order method", () => {
    return request(app)
      .get("/api/articles?sort_by=votes&order=asc")
      .expect(200)
      .then(({ body }) => {
        expect(body.articles).toBeSorted({ key: "votes" });
      });
  });
  test("GET 404: Not found if sort criteria is invalid column", () => {
    return request(app)
      .get("/api/articles?sort_by=sentiment")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Not Found");
      });
  });
});

describe("GET /api/articles (topic query)", () => {
  test("GET 200: Filters articles based on topic query", () => {
    return request(app)
      .get("/api/articles?topic=cats")
      .expect(200)
      .then(({ body }) => {
        body.articles.forEach((element) => {
          expect(element.topic).toBe("cats");
        });
      });
  });
  test("GET 200: Filters articles based on another topic query", () => {
    return request(app)
      .get("/api/articles?topic=mitch")
      .expect(200)
      .then(({ body }) => {
        body.articles.forEach((element) => {
          expect(element.topic).toBe("mitch");
        });
      });
  });
  test("GET 404: If topic doesn't exist, returns no articles", () => {
    return request(app)
      .get("/api/articles?topic=aliens")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Not Found");
      });
  });
  test("GET 400: Bad request if provided with invalid datatype", () => {
    return request(app)
      .get("/api/articles?topic=122")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad Request");
      });
  });
});
