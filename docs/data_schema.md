# Data Schema

The MyYachtsInsurance schema is defined in `myyachtsinsurance_blueprint.xlsx` (EntitiesAndFields sheet). This document provides an overview of the main entities and relationships.

## Key Entities

- **Profile**: Stores user information (username, email, yachts owned, primary vessel, reputation, role).
- **Vessel**: Stores information about each yacht owned by a user (name, type, length, year built, flag state, home port).
- **Post**: Represents a user-created post with a title, body in Markdown, category reference, optional tags, associated yacht type/length/company/location, status and metadata (views, score).
- **Comment**: Represents a comment on a post (or reply to another comment) with threaded structure.
- **Reaction**: Stores reactions (like, dislike, share, bookmark) associated with a post or comment.
- **Category**: High-level categorization of posts (e.g., Claims, Policies, Regulations).
- **Tag**: Additional labels for posts (e.g., hurricane, fire, hull damage).
- **Location**: Hierarchical taxonomy for yacht locations (e.g., Caribbean, Mediterranean, Florida).
- **Company**: Represents insurers, brokers or providers with verification status.
- **FAQ**: Frequently asked questions and their answers.
- **Follow**: Social graph capturing follower–followee relationships.
- **Notification**: Records notifications for users.

## Relationships

- Profiles can own multiple vessels.
- Profiles can create multiple posts and comments.
- Posts can have multiple tags (many-to-many via PostTag).
- Posts and comments can have many reactions.
- Posts are linked to categories, optional company, optional location and metadata fields.
- Comments are threaded via parent_id referencing another comment or null for top-level.
- Follow entries represent user-to-user following.
- Notifications reference posts or comments and deliver to a user.

Refer to the blueprint workbook for full field details and data types.
