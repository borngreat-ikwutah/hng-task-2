# HNG Task 1 Backend API

This project is the backend solution for **HNG Task 1**. It accepts a name, calls three external public APIs, applies classification logic, stores the result in a database, and exposes a REST API for creating, retrieving, listing, and deleting profiles.

## Overview

When a request is made to create a profile, the service:

1. validates the input name
2. checks if the profile already exists
3. calls the following external APIs in parallel:
   - Genderize: `https://api.genderize.io?name={name}`
   - Agify: `https://api.agify.io?name={name}`
   - Nationalize: `https://api.nationalize.io?name={name}`
4. applies classification rules
5. stores the result in the database
6. returns the created or existing profile

The service also supports filtering existing profiles by gender, country, and age group.

---

## Features

- Create profiles from a name
- Prevent duplicate profile creation
- Retrieve a single profile by ID
- List all profiles
- Filter profiles by:
  - `gender`
  - `country_id`
  - `age_group`
- Delete profiles by ID
- CORS enabled for all origins
- Zod validation for request and environment variables
- Drizzle ORM for database access

---

## Data classification rules

### Age group
Based on the Agify API response:

- `0–12` → `child`
- `13–19` → `teenager`
- `20–59` → `adult`
- `60+` → `senior`

### Nationality
The nationality is determined by selecting the country with the highest probability from the Nationalize API response.

---

## API Endpoints

### 1. Create Profile
`POST /api/profiles`

Creates a new profile from a submitted name.

#### Request body
```json
{
  "name": "ella"
}
```

#### Success response: 201 Created
```json
{
  "status": "success",
  "data": {
    "id": "b3f9c1e2-7d4a-4c91-9c2a-1f0a8e5b6d12",
    "name": "ella",
    "gender": "female",
    "gender_probability": 0.99,
    "sample_size": 1234,
    "age": 46,
    "age_group": "adult",
    "country_id": "DRC",
    "country_probability": 0.85,
    "created_at": "2026-04-01T12:00:00Z"
  }
}
```

#### Duplicate name response: 200 OK
If the same name is submitted again, the existing profile is returned.

```json
{
  "status": "success",
  "message": "Profile already exists",
  "data": {
    "id": "b3f9c1e2-7d4a-4c91-9c2a-1f0a8e5b6d12",
    "name": "ella",
    "gender": "female",
    "gender_probability": 0.99,
    "sample_size": 1234,
    "age": 46,
    "age_group": "adult",
    "country_id": "DRC",
    "country_probability": 0.85,
    "created_at": "2026-04-01T12:00:00Z"
  }
}
```

#### Error responses
- `400 Bad Request` — missing or empty name
- `422 Unprocessable Entity` — invalid type
- `502 Bad Gateway` — invalid upstream response from Genderize, Agify, or Nationalize
- `500 Internal Server Error` — unexpected server failure

Example error response:
```json
{
  "status": "error",
  "message": "Missing or empty name"
}
```

---

### 2. Get Single Profile
`GET /api/profiles/{id}`

Returns a single profile by its ID.

#### Success response: 200 OK
```json
{
  "status": "success",
  "data": {
    "id": "b3f9c1e2-7d4a-4c91-9c2a-1f0a8e5b6d12",
    "name": "emmanuel",
    "gender": "male",
    "gender_probability": 0.99,
    "sample_size": 1234,
    "age": 25,
    "age_group": "adult",
    "country_id": "NG",
    "country_probability": 0.85,
    "created_at": "2026-04-01T12:00:00Z"
  }
}
```

#### Error responses
- `404 Not Found` — profile not found
- `500 Internal Server Error` — unexpected failure

---

### 3. Get All Profiles
`GET /api/profiles`

Returns all profiles, with optional filtering.

#### Optional query parameters
- `gender`
- `country_id`
- `age_group`

Query parameters are case-insensitive.

#### Example
`GET /api/profiles?gender=male&country_id=NG`

#### Success response: 200 OK
```json
{
  "status": "success",
  "count": 2,
  "data": [
    {
      "id": "id-1",
      "name": "emmanuel",
      "gender": "male",
      "age": 25,
      "age_group": "adult",
      "country_id": "NG"
    },
    {
      "id": "id-2",
      "name": "sarah",
      "gender": "female",
      "age": 28,
      "age_group": "adult",
      "country_id": "US"
    }
  ]
}
```

#### Error responses
- `500 Internal Server Error` — unexpected failure

---

### 4. Delete Profile
`DELETE /api/profiles/{id}`

Deletes a profile by ID.

#### Success response: 204 No Content
No body is returned.

#### Error responses
- `404 Not Found` — profile not found
- `500 Internal Server Error` — unexpected failure

---

## Error response format

All errors follow this structure:

```json
{
  "status": "error",
  "message": "Error message here"
}
```

---

## Environment variables

This project uses environment variables for configuration.

### Required
- `DATABASE_URL` — database connection string
- `NODE_ENV` — runtime environment (`development`, `test`, or `production`)

Example:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/mydb"
NODE_ENV="development"
```

---

## Tech stack

- **Runtime:** Bun
- **Framework:** Hono
- **Database:** PostgreSQL
- **ORM:** Drizzle ORM
- **Validation:** Zod

---

## Development

### Install dependencies
```sh
bun install
```

### Run the app locally
```sh
bun run dev
```

### Database commands
```sh
bun run db:generate
bun run db:migrate
bun run db:push
bun run db:studio
```

---

## Notes

- All timestamps are returned in UTC ISO 8601 format.
- All IDs are UUID v7.
- CORS is enabled with `Access-Control-Allow-Origin: *`.
- External APIs are called in parallel to reduce request time.
- Duplicate profile creation is prevented by checking the normalized name.

---

## Project structure

- `src/index.ts` — app entry point and route registration
- `src/controllers/` — reusable HTTP controllers
- `src/repository.ts` — database access layer
- `src/utils/` — shared utilities
- `src/db/` — database schema and client
- `src/lib/` — external API and validation logic

---

## Submission

This repository is prepared for **HNG Task 1**.

Make sure to deploy the API and submit:

- your live base URL
- your GitHub repository link

## Deployment on Cloudflare Workers

This app can be deployed to **Cloudflare Workers** using **Cloudflare D1** as the database.

### D1 setup

Create a D1 database in Cloudflare and bind it to the Worker as `DB`.

Example `wrangler` commands:

```sh
wrangler d1 create hng-task-1-db
wrangler d1 execute hng-task-1-db --file=./src/db/migrations/0001_initial.sql
```

Then update `wrangler.toml` with the real `database_id` from Cloudflare.

### Worker setup
- Entry point: `src/index.ts`
- Runtime: Hono running on Cloudflare Workers
- Compatibility: enable `nodejs_compat` if you use any Node-style APIs

### Wrangler config
Use a `wrangler.toml` file similar to:

```/dev/null/wrangler.toml#L1-12
name = "hng-task-1"
main = "src/index.ts"
compatibility_date = "2026-04-17"
compatibility_flags = ["nodejs_compat"]

[[d1_databases]]
binding = "DB"
database_name = "hng-task-1-db"
database_id = "YOUR_D1_DATABASE_ID"

[vars]
NODE_ENV = "production"
```

### Environment variables
Set the following in Cloudflare:
- `NODE_ENV`

### D1 binding
Bind your D1 database to the Worker as:
- `DB`

### Local testing
For local development, you can use Wrangler to run the Worker against D1:

```sh
wrangler dev
```

### Deploy steps
1. Create a Cloudflare D1 database
2. Bind it in `wrangler.toml`
3. Run the worker locally with `wrangler dev`
4. Deploy with `wrangler deploy`

### Notes
- CORS is enabled for `Access-Control-Allow-Origin: *`
- The app returns JSON responses for all endpoints
- Database access uses Drizzle ORM with Cloudflare D1

---

## License

This project is provided for HNG task submission and learning purposes.