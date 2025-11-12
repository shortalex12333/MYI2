# Permissions and Roles

The platform uses role-based access control (RBAC) to define what actions each type of user can perform.

## Roles

- **guest**: Unauthenticated visitor.
- **user**: Registered user.
- **verified_user**: Verified identity (e.g., email confirmed or KYC).
- **broker_verified**: Verified yacht insurance broker.
- **insurer_verified**: Verified insurer representative.
- **moderator**: Responsible for content moderation.
- **admin**: Full administrative access.

## Permissions Matrix

| Role | Read Public | Create Posts | Comment | React | Moderate |
|-----|-------------|--------------|---------|-------|---------|
| guest | yes | no | no | no | no |
| user | yes | yes | yes | yes | no |
| verified_user | yes | yes | yes | yes | no |
| broker_verified | yes | yes | yes | yes | no |
| insurer_verified | yes | yes | yes | yes | no |
| moderator | yes | yes | yes | yes | yes |
| admin | yes | yes | yes | yes | yes |

- **Read Public**: Ability to view public pages and posts.
- **Create Posts**: Permission to create new posts.
- **Comment**: Permission to comment on posts.
- **React**: Ability to like or react to posts/comments.
- **Moderate**: Permission to review flags, delete posts/comments, ban users, etc.

### Additional Considerations

- **Anonymous Posting**: Even unregistered users may be allowed to ask questions anonymously, but their posts/comments require moderation before publishing.
- **Rate Limits**: Different roles have different rate limits; moderators and admins have higher limits, while guests and new users have stricter limits.
- **Verification**: Verification for brokers and insurers is handled through manual review; once verified, they can tag themselves on posts and companies.
