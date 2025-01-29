# Northcoders News API

Welcome to Northcoders News API.

> Hosted application
> Project summary
> API Endpoints
> Setup & Installation
> Dependencies
> Acknowledgements

# Hosted application

The database is hosted on Superbase and the web service hosted on Render.

The application can be accessed here:

> https://nc-news-owjx.onrender.com/

# Project summary

A RESTful API backend service for managing news articles, comments, and user interactions. Built with Express.js, this API provides endpoints for retrieving, posting, and managing articles, comments, and user data.

Features

Article management with full CRUD operations
Comment system with posting and deletion capabilities
User management system
Topic-based article organization
Voting system for articles

# API Endpoints

GET Endpoints

/api - List all available endpoints
/api/topics - Get all topics
/api/articles/:article_id - Get specific article
/api/articles - Get all articles (supports sorting, ordering, and topic filtering)
/api/articles/:article_id/comments - Get comments for specific article
/api/users - Get all users

POST & DELETE Endpoints

POST /api/articles/:article_id/comments - Add a comment to an article
PATCH /api/articles/:article_id - Update article votes
DELETE /api/comments/:comment_id - Delete a specific comment

Error Handling

Custom error handling middleware for:

404 Not Found errors
400 Bad Request errors
Generic error handling with appropriate status codes

# Setup & Installation

Prerequisites

Node.js (v18 or higher recommended)
PostgreSQL (v14 or higher)
npm or yarn package manager

Environment setup

1. Clone the repository
2. Install dependencies
3. Create environment files

- .env.development
- .env.test
- .env.production

Database setup

1. Create the databases
2. Seed the database (review the package.json file for seeding scripts)

# Dependencies

Development Dependencies:

Husky: v8.8.2 (Git hooks)
Jest: v27.5.1 (Testing framework)
Jest-extended: v2.0.0 (Additional Jest matchers)
Jest-sorted: v1.0.15 (Jest sorting matchers)
Supertest: v7.0.0 (HTTP testing library)

Main Dependencies:

Dotenv: v16.0.0 (Environment variable management)
Express: v4.21.2 (Web framework)
pg-format: v1.0.4 (PostgreSQL formatting)
pg: v8.7.3 (PostgreSQL client)

# Acknowledgements

This project was created as part of a Digital Skills Bootcamp in Software Engineering provided by [Northcoders](https://northcoders.com/)
Thanks to all the NC teaching team who helped shape this project.
