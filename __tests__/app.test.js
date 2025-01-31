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
  test("GET 404: Responds with endpoint error if url is incorrect", () => {
    return request(app)
      .get("/api/user")
      .expect(404)
      .then(({ body }) => {
        expect(body.error).toBe("Endpoint not found");
      });
  });
});

describe("GET /api/articles/:article_id (comment_count)", () => {
  test("GET 200: Responds with article object which now includes comment-count property", () => {
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
        expect(body.article).toHaveProperty(
          "comment_count",
          expect.any(Number)
        );
      });
  });
});

describe("GET /api/users/:username", () => {
  test("GET 200: Responds with a user object with correct properties", () => {
    return request(app)
      .get("/api/users/lurker")
      .expect(200)
      .then(({ body }) => {
        expect(body.user).toMatchObject({
          username: expect.any(String),
          name: expect.any(String),
          avatar_url: expect.any(String),
        });
      });
  });
  test("GET 404: Not Found if username does not exist", () => {
    return request(app)
      .get("/api/users/shams")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Not Found");
      });
  });
  test("GET 400: Bad Request if username is invalid datatype", () => {
    return request(app)
      .get("/api/users/123")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad Request");
      });
  });
});

describe("PATCH /api/comments/:comment_id", () => {
  test("PATCH 200: Accepted patch request with positive number", () => {
    const patchRequest = {
      inc_votes: 1,
    };
    return request(app)
      .patch("/api/comments/1")
      .send(patchRequest)
      .expect(200)
      .then(({ body }) => {
        expect(body.comment).toMatchObject({
          comment_id: 1,
          body: "Oh, I've got compassion running out of my nose, pal! I'm the Sultan of Sentiment!",
          votes: 17,
          author: "butter_bridge",
          article_id: 9,
          created_at: expect.any(String),
        });
      });
  });
  test("PATCH 200: Test if increments", () => {
    const patchRequest = {
      inc_votes: 1,
    };
    return request(app)
      .patch("/api/comments/1")
      .send(patchRequest)
      .expect(200)
      .then(({ body }) => {
        expect(body.comment.votes).toBe(17);
        return request(app)
          .patch("/api/comments/1")
          .send(patchRequest)
          .expect(200);
      })
      .then(({ body }) => {
        expect(body.comment.votes).toBe(18);
      });
  });
  test("PATCH 200: Accepted patch request with negative number", () => {
    const patchRequest = {
      inc_votes: -1,
    };
    return request(app)
      .patch("/api/comments/1")
      .send(patchRequest)
      .expect(200)
      .then(({ body }) => {
        expect(body.comment).toMatchObject({
          body: "Oh, I've got compassion running out of my nose, pal! I'm the Sultan of Sentiment!",
          votes: 15,
          author: "butter_bridge",
          article_id: 9,
          created_at: expect.any(String),
        });
      });
  });
  test("PATCH 400: Bad request if invalid data", () => {
    const patchRequest = {
      inc_votes: "one",
    };
    return request(app)
      .patch("/api/comments/1")
      .send(patchRequest)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad Request");
      });
  });
  test("PATCH 404: Comment Id not found", () => {
    const patchRequest = {
      inc_votes: 1,
    };
    return request(app)
      .patch("/api/comments/50")
      .send(patchRequest)
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Not Found");
      });
  });
});

describe("POST /api/articles", () => {
  test("POST:201 Successful post with existing author and existing topic", () => {
    const postArticle = {
      author: "rogersop",
      title: "Mindful coding",
      body: "Its important to take breaks with cats inbetween coding sessions...",
      topic: "cats",
      article_img_url: "https://images.pexels.com/photos/15",
    };
    return request(app)
      .post("/api/articles")
      .send(postArticle)
      .expect(201)
      .then(({ body }) => {
        expect(body.article).toMatchObject({
          author: "rogersop",
          title: "Mindful coding",
          body: "Its important to take breaks with cats inbetween coding sessions...",
          topic: "cats",
          article_img_url: "https://images.pexels.com/photos/15",
          article_id: expect.any(Number),
          votes: expect.any(Number),
          created_at: expect.any(String),
        });
      });
  });
  test("POST:201 Successful post if new topic, existing author", () => {
    const postArticle = {
      author: "rogersop",
      title: "Mindful coding",
      body: "Its important to take breaks with cats inbetween coding sessions...",
      topic: "coding",
      article_img_url: "https://images.pexels.com/photos/15",
    };
    return request(app)
      .post("/api/articles")
      .send(postArticle)
      .expect(201)
      .then(({ body }) => {
        expect(body.article).toMatchObject({
          author: "rogersop",
          title: "Mindful coding",
          body: "Its important to take breaks with cats inbetween coding sessions...",
          topic: "coding",
          article_img_url: "https://images.pexels.com/photos/15",
          article_id: expect.any(Number),
          votes: expect.any(Number),
          created_at: expect.any(String),
        });
      });
  });
  test("POST:201 Successful post if new author, existing topic", () => {
    const postArticle = {
      author: "shams",
      title: "Mindful coding",
      body: "Its important to take breaks with cats inbetween coding sessions...",
      topic: "cats",
      article_img_url: "https://images.pexels.com/photos/15",
    };
    return request(app)
      .post("/api/articles")
      .send(postArticle)
      .expect(201)
      .then(({ body }) => {
        expect(body.article).toMatchObject({
          author: "shams",
          title: "Mindful coding",
          body: "Its important to take breaks with cats inbetween coding sessions...",
          topic: "cats",
          article_img_url: "https://images.pexels.com/photos/15",
          article_id: expect.any(Number),
          votes: expect.any(Number),
          created_at: expect.any(String),
        });
      });
  });
  test("POST:201 Successful post if new author and new topic", () => {
    const postArticle = {
      author: "shams",
      title: "Mindful coding",
      body: "Its important to take breaks with cats inbetween coding sessions...",
      topic: "coding",
      article_img_url: "https://images.pexels.com/photos/15",
    };
    return request(app)
      .post("/api/articles")
      .send(postArticle)
      .expect(201)
      .then(({ body }) => {
        expect(body.article).toMatchObject({
          author: "shams",
          title: "Mindful coding",
          body: "Its important to take breaks with cats inbetween coding sessions...",
          topic: "coding",
          article_img_url: "https://images.pexels.com/photos/15",
          article_id: expect.any(Number),
          votes: expect.any(Number),
          created_at: expect.any(String),
        });
      });
  });
  test("POST:201 Resolves to use default input for article img url if none provided", () => {
    const postArticle = {
      author: "rogersop",
      title: "Mindful coding",
      body: "Its important to take breaks with cats inbetween coding sessions...",
      topic: "cats",
    };
    return request(app)
      .post("/api/articles")
      .send(postArticle)
      .expect(201)
      .then(({ body }) => {
        expect(body.article).toMatchObject({
          author: "rogersop",
          title: "Mindful coding",
          body: "Its important to take breaks with cats inbetween coding sessions...",
          topic: "cats",
          article_img_url:
            "https://images.pexels.com/photos/97050/pexels-photo-97050.jpeg?w=700&h=700",
          article_id: expect.any(Number),
          votes: expect.any(Number),
          created_at: expect.any(String),
        });
      });
  });
  test("POST:400 Bad request author includes incorrect datatype", () => {
    const postArticle = {
      author: 123,
      title: "Mindful coding",
      body: "Its important to take breaks with cats inbetween coding sessions...",
      topic: "cats",
      article_img_url: "https://images.pexels.com/photos/15",
    };
    return request(app)
      .post("/api/articles")
      .send(postArticle)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad Request");
      });
  });
  test("POST:400 Bad request topic includes incorrect datatype", () => {
    const postArticle = {
      author: "rogersop",
      title: "Mindful coding",
      body: "Its important to take breaks with cats inbetween coding sessions...",
      topic: 123,
      article_img_url: "https://images.pexels.com/photos/15",
    };
    return request(app)
      .post("/api/articles")
      .send(postArticle)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad Request");
      });
  });
  test("POST:400 Bad request if incorrect keys", () => {
    const postArticle = {
      author: "rogersop",
      title: "Mindful coding",
      body: "Its important to take breaks with cats inbetween coding sessions...",
      votes: "cats",
      article_img_url: "https://images.pexels.com/photos/15",
    };
    return request(app)
      .post("/api/articles")
      .send(postArticle)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad Request");
      });
  });
});

describe("GET /api/articles (pagination)", () => {
  test("GET 200: Default pagination settings", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body }) => {
        expect(body.articles.length).toBe(10);
      });
  });
  test("GET 200: Custom pagination settings", () => {
    return request(app)
      .get("/api/articles?limit=5")
      .expect(200)
      .then(({ body }) => {
        expect(body.articles.length).toBe(5);
      });
  });
  test("GET 200: Pagination, page two test", () => {
    return request(app)
      .get("/api/articles?limit=5&p=2")
      .expect(200)
      .then(({ body }) => {
        expect(body.articles.length).toBe(5);
      });
  });
  test("GET 200: Includes total count property", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body }) => {
        expect(body).toHaveProperty("total_count");
      });
  });
  test("GET 400: Bad request if invalid queries", () => {
    return request(app)
      .get("/api/articles?limit=-5&p=1")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad Request");
      });
  });
  test("GET 404: Not found if page number does not exist", () => {
    return request(app)
      .get("/api/articles?limit=10&p=100")
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
        expect(body.articles.length).toBe(10); // changed after page
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

describe("GET /api/articles/:article_id/comments (pagination)", () => {
  test("GET 200: Default pagination settings", () => {
    return request(app)
      .get("/api/articles/1/comments")
      .expect(200)
      .then(({ body }) => {
        expect(body.article.length).toBe(10);
      });
  });
  test("GET 200: Custom pagination settings", () => {
    return request(app)
      .get("/api/articles/1/comments?limit=5")
      .expect(200)
      .then(({ body }) => {
        expect(body.article.length).toBe(5);
      });
  });
  test("GET 200: Pagination, page two test", () => {
    return request(app)
      .get("/api/articles/1/comments?limit=5&p=2")
      .expect(200)
      .then(({ body }) => {
        expect(body.article.length).toBe(5);
      });
  });
  test("GET 400: Bad request if invalid queries", () => {
    return request(app)
      .get("/api/articles?limit=-5&p=1")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad Request");
      });
  });
  test("GET 404: Not found if page number does not exist", () => {
    return request(app)
      .get("/api/articles?limit=10&p=100")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Not Found");
      });
  });
});

describe("POST /api/topics", () => {
  test("POST:201 Responds with post object on successful post request", () => {
    const postTopic = {
      slug: "football",
      description: "Read all about soccer!",
    };
    return request(app)
      .post("/api/topics")
      .send(postTopic)
      .expect(201)
      .then(({ body }) => {
        expect(body.topic).toMatchObject(postTopic);
      });
  });
  test("POST:400 Bad request if post includes incorrect data types", () => {
    const postTopic = {
      slug: 123,
      description: "Read all about soccer!",
    };
    return request(app)
      .post("/api/topics")
      .send(postTopic)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad Request");
      });
  });
  test("POST:400 Bad request if topic is missing properties", () => {
    const postTopic = {
      slug: "football",
    };
    return request(app)
      .post("/api/topics")
      .send(postTopic)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad Request");
      });
  });
  test("POST:409 Conflict if topic already exists", () => {
    const postTopic = {
      slug: "mitch",
      description: "Read all about soccer!",
    };
    return request(app)
      .post("/api/topics")
      .send(postTopic)
      .expect(409)
      .then(({ body }) => {
        expect(body.error).toBe("Conflict: Topic already exists");
      });
  });
});

describe("DELETE /api/articles/:article_id", () => {
  test("DELETE 204: Deletes article based on id and all comments", () => {
    return request(app)
      .delete("/api/articles/1")
      .expect(204)
      .then(() => {
        return Promise.all([
          db.query("SELECT * FROM articles WHERE article_id = 1"),
          db.query("SELECT * FROM comments WHERE article_id = 1"),
        ]).then(([articleResult, commentResult]) => {
          expect(articleResult.rows.length).toBe(0);
          expect(commentResult.rows.length).toBe(0);
        });
      });
  });
  test("DELETE 404: Article not found if non-existent article_id", () => {
    return request(app)
      .delete("/api/articles/100")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Not Found");
      });
  });
  test("DELETE 400: Bad request if invalid data", () => {
    return request(app)
      .delete("/api/articles/thirtythree")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad Request");
      });
  });
});
