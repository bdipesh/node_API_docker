Render deployment guide: Postgres + Node + Prisma

Overview
This guide shows how to deploy a managed PostgreSQL database on Render and connect this API to it, including migrations and health checks. It also covers best practices to avoid “Can’t reach database server” errors.

What you’ll set up
- A Render PostgreSQL instance (managed)
- A Render Web Service for this API
- Environment variables (DATABASE_URL, JWT secrets)
- Automatic Prisma generate + migrate on build

Prerequisites
- Render account (free tier works)
- GitHub repo containing this project
- Prisma installed locally if you want to run migrations before deploy (optional)

Step 1 — Create a Render PostgreSQL database
1) In Render, click New → PostgreSQL.
2) Name: task-api-db (any name)
3) Choose Region close to your users and your Web Service region.
4) Create Database.
5) After provisioned, open the database page → Connections.
   - Copy: Internal Database URL (use in same Render region) OR External Database URL (for local dev). Both typically require SSL.
   - Also copy: Pooled connection string (recommended for web apps) if available. Use pooled for the web service.

Notes about SSL
- Prisma supports Postgres SSL via connection parameter `?sslmode=require`.
- Render URLs usually include sslmode; if yours doesn’t, append `?sslmode=require` to the end of the connection string.

Step 2 — Configure environment variables
You need the following env vars in your Render Web Service:
- DATABASE_URL: Use the Pooled Internal Database URL from Render if available. Otherwise use the Internal Database URL. Ensure `sslmode=require`.
- JWT_SECRET: Generate a secure random string for signing access tokens.
- JWT_REFRESH_SECRET: Generate a secure random string for refresh tokens.
- (Optional) BASE_URL: e.g., https://api.yoursfriend.com so Swagger adds it to Servers.

Example values
- DATABASE_URL (pooled): postgres://USER:PASSWORD@RENDER_HOST:PORT/DBNAME?pgbouncer=true&connection_limit=1&sslmode=require
- DATABASE_URL (direct):  postgres://USER:PASSWORD@RENDER_HOST:PORT/DBNAME?sslmode=require

Important: Use pooled connection for web services to avoid exhausting DB connections.

Step 3 — Deploy the Web Service
1) From Render dashboard, click New → Web Service.
2) Connect your GitHub repo for this project.
3) Environment: Node.
4) Build Command: yarn render-build (or npm run render-build)
5) Start Command: node dist/index.js
6) Add the environment variables listed above.
7) Create Web Service. First build will:
   - prisma generate
   - prisma migrate deploy (applies migrations)
   - tsc compile

About the repo scripts
We added two scripts in package.json:
- "postinstall": "prisma generate" → ensures Prisma client is generated on every install.
- "render-build": "prisma generate && prisma migrate deploy && tsc" → used by Render to apply migrations and build the app.

Step 4 — Verify after deployment
- Visit https://<your-service>.onrender.com/health → should return { status: "healthy", database: "connected" } when DB is reachable.
- Visit /docs for the Swagger UI; /docs.json for OpenAPI spec.
- If using a custom domain (e.g., https://api.yoursfriend.com), set BASE_URL env var to that domain to appear in Swagger Servers.

Local development with Render DB (optional)
If you want your local app to use the Render database:
1) In Render DB → Connections, copy the External Database URL.
2) In your local .env, set DATABASE_URL to that external URL (keep sslmode=require).
3) Run:
   - npm install
   - npx prisma generate
   - npx prisma migrate deploy   # applies existing migrations
   - npm run dev

Troubleshooting
- Error: “Can’t reach database server at …”
  - Ensure DATABASE_URL is set on the Web Service and has sslmode=require.
  - Make sure the DB and Web Service are in the same region, and use Internal URL when possible.
  - Prefer the pooled (PgBouncer) connection string to limit connections.
  - The API already returns HTTP 503 with a friendly message when DB is down.

- Migrations failing in Render build
  - Open Render logs. Verify DATABASE_URL is correct and has privileges.
  - If you haven’t created migrations locally, create them via `npx prisma migrate dev` locally against the DB, commit the migrations folder, then redeploy.

- Swagger shows no endpoints in production
  - We already scan both src and dist route files. If BASE_URL is set, it will appear as a server. Access /docs.json to verify paths.

Security notes
- Do not commit .env with secrets.
- Use separate JWT secrets for access and refresh.
- Rotate DATABASE_URL password if leaked.

That’s it! Your API should work with Render’s Postgres reliably. If you need help reviewing your Render settings, share your Render service name and we can double-check your configuration.
