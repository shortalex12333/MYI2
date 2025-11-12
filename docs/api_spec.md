# API Specification

This document summarizes the API endpoints. All endpoints are versioned under `/api/v1/`. For detailed field definitions and payloads, see the blueprint workbook (APIEndpoints sheet).

| Method | Path | Auth | Description |
|-------|------|------|-------------|
| POST | /auth/signup | none | Create new user account |
| POST | /auth/login | none | Login and return token |
| GET | /profile/{id} | token | Retrieve user profile |
| PUT | /profile/{id} | user | Update own profile |
| GET | /posts | optional | List posts with optional filters (category, tag, location, company, search query, pagination) |
| POST | /posts | user | Create a new post |
| GET | /posts/{id} | optional | Get a specific post by id |
| PUT | /posts/{id} | owner | Update own post |
| DELETE | /posts/{id} | owner | Delete own post |
| GET | /comments?post_id={id} | optional | List comments for a post |
| POST | /comments | user | Create a comment on a post or reply to another comment |
| PUT | /comments/{id} | owner | Update own comment |
| DELETE | /comments/{id} | owner | Delete own comment |
| POST | /reactions | user | Add or remove a like/upvote on a post or comment |
| GET | /categories | optional | List categories |
| GET | /tags | optional | List tags |
| GET | /locations | optional | List locations |
| GET | /companies | optional | List registered companies/providers |
| GET | /faqs | optional | List frequently asked questions |
| POST | /flags | user | Flag a post or comment for moderation |
| GET | /notifications | user | List user notifications |
| PUT | /notifications/{id} | user | Mark notification as read |
| GET | /search | optional | Full-text search across posts, comments, and companies |
