# Moe.cut — admin access

- **Username:** `aflaton-skimo`
- **Password:** `skimo7777`
- **Login:** `/login`. Footer **ADMIN** opens login; successful login opens `/admin`.
- **Local website:** http://127.0.0.1:5173

## One Vercel project: deployment settings

This repository can deploy the React frontend and Express API together in **one Vercel project, one deployment, and one domain**. Use the **`Moe.cut` subfolder as the Vercel Root Directory**. This folder contains both frontend and backend code; do not select `src`, the repository root, or the top-level `backend` folder.

| Vercel setting | Value |
| --- | --- |
| Git repository | `Bader7771/Moe.cut` |
| Root Directory | `Moe.cut` |
| Framework Preset | Vite |
| Install Command | `npm ci` |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Node.js Version | 24.x |

`Moe.cut/vercel.json` declares the framework, commands, output directory, security headers, and rewrites. No second Vercel project or separately hosted Express server is needed. Do not configure a production start command: Vercel serves the static build and invokes the API handler itself.

Add these **backend-only** environment variables in Vercel for each deployment environment you use (Production and, if needed, Preview):

| Variable | Value |
| --- | --- |
| `MONGO_URI` | Your MongoDB connection string, including the intended database name, for example `mongodb+srv://USER:PASSWORD@CLUSTER/mo-cut-motion` |
| `JWT_SECRET` | A long random secret, kept stable between deployments/function instances |
| `ADMIN_USERNAME` | `aflaton-skimo` |
| `ADMIN_PASSWORD` | `skimo7777` |

Generate a JWT secret locally with `node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"`, then paste it into Vercel settings. Do not commit that secret. Configure the database user's permissions and network access so Vercel can connect to MongoDB. Use an isolated database for previews if preview edits must not affect production.

Leave `DATA_STORE`, `DATA_DIR`, and `PORT` unset on Vercel. Do not set any `VITE_API_URL`: the frontend already uses relative `/api/...` URLs. Never prefix backend secrets with `VITE_`, which would expose them to the browser. `.env.example` is a template; Vercel uses dashboard environment variables, not local `.env` files.

## Final architecture

```text
repository/
├── Moe.cut/                    ← Vercel Root Directory: frontend AND backend
│   ├── src/                    React UI and React Router
│   ├── public/                 Static project images and icons
│   ├── api/index.js            Single Vercel Function: exports Express app
│   ├── app.js                  Express middleware and /api routes; no listen()
│   ├── server.js               Local-only listener, excluded from API import path
│   ├── routes/                 Auth, projects, testimonials, uploaded images
│   ├── middleware/auth.js      JWT authentication for admin writes
│   ├── config/                 Environment validation and cached MongoDB connection
│   ├── models/                 Project, Testimonial, UploadedImage
│   ├── services/               Persistence and upload handling
│   ├── uploads/                Existing/local image files
│   ├── scripts/copy-uploads.mjs Bundles existing uploads into dist/uploads
│   ├── tests/                  Deployment and serverless API regression checks
│   ├── dist/                   Generated static frontend; not committed
│   ├── package.json
│   ├── package-lock.json
│   ├── vite.config.js
│   ├── vercel.json
│   └── .env.example
├── backend/                    Legacy duplicate backend; outside Vercel root
├── scripts/                    Local combined runner and regression checks
├── package.json                Local convenience commands
└── README.md
```

The frontend compiles with Vite and is served as static files by Vercel. `/login` and `/admin` rewrite to `index.html`, so direct navigation and refresh work with React Router. Static `/assets/*`, `/projects/*`, and bundled `/uploads/*` files retain filesystem routing. Missing static files return 404 instead of the React HTML document.

`/api/:path*` rewrites to the function exposed by `api/index.js` at `/api`. Express receives the request and handles the `/api` route namespace. No port is bound in the function's import graph. The separate local `server.js` is only used by `npm start` outside Vercel.

| API | Behavior |
| --- | --- |
| `POST /api/auth/login` | Username/password login |
| `GET /api/auth/me` | Validate admin JWT |
| `GET /api/health` | Check required configuration and database readiness |
| `/api/projects` and `/api/projects/:id` | Public reads; authenticated create/update/delete |
| `/api/testimonials` and `/api/testimonials/:id` | Public reads; authenticated create/update/delete |
| `GET /api/uploads/:id` | Serve a stored image from MongoDB |
| `GET /api/hello` | Existing diagnostic endpoint |
| Other `/api/*` | JSON 404, never the SPA HTML |

Requests are same-origin, so CORS is unnecessary. Localhost URLs exist only in local development proxies/runners, not frontend API calls. MongoDB connections are established when data is requested, reused within each warm instance, shared by concurrent initial requests, and retried after failures. Authentication does not wait for a database connection.

## Persistent content and images

On Vercel, projects, testimonials, and newly uploaded images are stored in MongoDB. MongoDB is a data service, **not a second frontend/backend deployment**. This uses the database already required by the application and does not require a separate upload host or Blob credentials. New images have relative `/api/uploads/<id>` URLs, compatible with the same-origin image security policy.

Uploads accept JPG, PNG, WebP, and GIF files up to **4 MiB**. This leaves room for multipart fields under Vercel's 4.5 MB request limit. Both the admin UI and backend enforce the limit. New hosted uploads are buffered in memory and persisted in MongoDB, never written to the function's filesystem. Image storage consumes database capacity. Image URLs are immutable; deleting a content record currently leaves its image in storage, matching the previous file-upload behavior.

The two existing committed images in `Moe.cut/uploads/` are copied into `dist/uploads/` at build time, preserving their existing URLs. Local files not committed to GitHub are not present in a Git-based deployment. Local JSON data in `Moe.cut/storage/` is also not deployed or automatically imported into MongoDB. Existing MongoDB records are retained; a new database starts empty. To transfer local content, recreate it through the hosted admin dashboard, or migrate it deliberately before launch. Do not run the legacy seed scripts against a database containing content you want to keep: they delete existing records.

## Local development

From the repository root:

```sh
npm --prefix Moe.cut install
npm run dev
```

This runs Vite on port 5173 and Express on port 5001, with both `/api` and `/uploads` proxied by Vite. Root commands explicitly use local persistent file storage in `Moe.cut/storage/` and images in `Moe.cut/uploads/`. The six sample projects are seeded only when the local storage file does not exist. Local testimonials start empty; edits and deletions survive restarts.

For a built local version on http://localhost:5001, run `npm start` from the repository root. To test against MongoDB locally, configure `Moe.cut/.env`, leave `DATA_STORE` unset, then run `npm --prefix Moe.cut run build` and `npm --prefix Moe.cut start`.

The top-level `backend/` remains available for legacy local use and includes the same backend fixes. The Vercel project does not import or deploy it. Do not start it at the same time as the combined app on port 5001.

## Inspection findings and verification

Fixed the serverless blockers: disk uploads, a non-retrying startup connection promise, per-instance fallback JWT secrets on Vercel, legacy Vercel `builds` configuration, overly broad SPA fallback, and missing static upload output. Explicit runtime validation rejects file storage or missing backend configuration on Vercel. Local standalone behavior is preserved.

Checks:

```sh
npm run build
npm --prefix Moe.cut run lint
npm --prefix Moe.cut test
node scripts/check-storage.mjs
# With npm run dev running:
node scripts/check-api.mjs
```

The serverless suite imports the exact function entry with Vercel environment settings, asserts that importing it opens no listener or database connection, tests connection retries/reuse, then exercises login, protected CRUD, Mongo-backed image responses, size limits, configuration errors, and unknown API routes. It uses database doubles and temporary HTTP ports; it does not connect to a real Atlas cluster. Local regression checks verify file persistence and frontend proxy requests. The build and dependency-lock dry run pass. Existing warnings remain for frontend bundle size and an unused import in `TestimonialsLayer.jsx`.

A live Vercel deployment and real MongoDB connectivity have **not** been verified from this workspace. After importing and configuring the project, verify `/api/health`, direct `/login` and `/admin` navigation, login, image upload, edit, delete, and image persistence after redeploying. The code changes alone do not configure your Vercel account or database.

Pre-existing content limitations, separate from hosting: the homepage `TestimonialGameboy` uses hardcoded entries rather than the admin testimonial API; its three `/videos/testimonial*.mp4` files are absent. The API-driven `TestimonialsLayer` component is not mounted on the homepage. The imported breakable-box email form validates locally but does not send or store email. These features were not redesigned as part of the deployment adaptation.

Official references: [Vercel Node.js Functions](https://vercel.com/docs/functions/runtimes/node-js), [Vite SPA routing](https://vercel.com/docs/frameworks/frontend/vite), [Vercel configuration](https://vercel.com/docs/project-configuration/vercel-json), [function payload limits](https://vercel.com/docs/functions/limitations), [Mongoose connection reuse in serverless functions](https://mongoosejs.com/docs/lambda.html).
