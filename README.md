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

## Vercel Environment Variables

Add these in **Vercel → your Moe.cut project → Settings → Environment Variables**. This list comes from the application code, not a generic Express template. The Vercel Root Directory must be `Moe.cut`.

| Variable | Required | Value to provide | Safe example format (not a real secret) | Production | Preview | Development |
| --- | --- | --- | --- | --- | --- | --- |
| `MONGO_URI` | **REQUIRED** | A working MongoDB connection string with database credentials and the intended database name. The database must permit connections from Vercel. | `mongodb+srv://DB_USER:URL_ENCODED_PASSWORD@YOUR_CLUSTER.mongodb.net/mo-cut-motion` | Required | Required for each preview that runs the API; check branch-specific overrides | Set for MongoDB/Vercel CLI development; unnecessary for the root local file-storage runner |
| `JWT_SECRET` | **REQUIRED** | A long random signing secret. Keep it consistent across instances/deployments of the same environment. Changing it invalidates existing login tokens. | `<64-random-hex-characters-generated-locally>` | Required | Required; may use a separate preview secret | Set for production-like development; plain local mode has an ephemeral fallback |
| `ADMIN_USERNAME` | **REQUIRED** | The exact username you want to type at `/login`. Set `aflaton-skimo` to retain the requested username. | `your-admin-username` | Required | Required | Set for production-like development; plain local mode has a default |
| `ADMIN_PASSWORD` | **REQUIRED** | The exact password you want to type at `/login`. The earlier requested local password is documented at the top of this README; a hosted override becomes the hosted login password. | `<your-private-admin-password>` | Required | Required | Set for production-like development; plain local mode has a default |

**Production and Preview are separate scopes.** Setting a variable only for Production does not configure Preview. Select Development too if using Vercel's development workflow. Vercel Development variables are used locally by its CLI; the ordinary repository-root `npm run dev` command does not download dashboard variables. It uses local file storage and loads `Moe.cut/.env` for any overrides. Whenever `process.env.VERCEL` is truthy, the code requires all four variables regardless of environment name. See [Vercel environment scopes](https://vercel.com/docs/environment-variables).

Generate a JWT secret on your own computer, then paste the result as the value (not the command):

```sh
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

The example placeholders above must be replaced. Paste raw values without `.env` assignment syntax, surrounding quotes, or trailing newlines. A placeholder or whitespace-only value is technically nonempty and passes the current presence check, but is not a valid configuration. The validator checks presence, not URI correctness, secret length, or password strength.

**Optional variables:** there are no optional application variables that need to be added for hosted Production or Preview. Uploads use `MONGO_URI` through the same MongoDB connection; they do not require any Blob, Cloudinary, S3, or separate upload credentials.

**Variables to leave unset or not add manually:**

| Variable | Actual behavior / why it should not be added |
| --- | --- |
| `DATA_STORE` | Leave unset on Vercel. The exact value `file` is explicitly rejected and causes the reported configuration error. Other values are not rejected, but have no useful hosted purpose; MongoDB is used. Only use `DATA_STORE=file` for ordinary local development outside Vercel. |
| `DATA_DIR` | Local JSON storage directory override only; ignored by hosted MongoDB storage. Not a required Vercel variable. |
| `PORT` | Read only by the local listener in `server.js`. Vercel invokes `api/index.js` instead. Leave unset. |
| `VERCEL` | Vercel-provided system flag, read by the app to detect the runtime. Do not manually override it or use it to bypass validation. Keep automatic system environment-variable exposure enabled. |
| `NODE_ENV` | No application validation requires it. Vercel/build tooling manages it; do not add it to fix this error. |
| `VITE_API_URL`, `VITE_BACKEND_URL`, `REACT_APP_API_URL` | Not read by this frontend. API calls use relative `/api/...` paths. Adding these will not fix the error. |
| `VITE_MONGO_URI`, `VITE_JWT_SECRET`, `VITE_ADMIN_USERNAME`, `VITE_ADMIN_PASSWORD` | Wrong names for this backend. Never expose database credentials or authentication secrets using browser-visible `VITE_` variables. |
| `DATABASE_URL`, `MONGODB_URI` | Not aliases for `MONGO_URI` in this code. An integration providing one of these names does not satisfy the validator; add the required `MONGO_URI` key. |
| `BLOB_READ_WRITE_TOKEN`, Cloudinary/S3/email-service keys | Not read by the current application. No additional upload or email environment variables are required. The imported email form does not send email. |

**Exact validation responsible for the error:** `Moe.cut/config/env.js:5–10`:

```js
export function validateEnvironment() {
  if (!process.env.VERCEL) return;
  if (process.env.DATA_STORE === 'file') throw new Error('DATA_STORE=file is only supported locally.');
  for (const name of ['MONGO_URI', 'JWT_SECRET', 'ADMIN_USERNAME', 'ADMIN_PASSWORD']) {
    if (!process.env[name]) throw new Error(`Missing required environment variable: ${name}`);
  }
}
```

`Moe.cut/app.js:16–20` calls this function before every `/api` route, including login and health checks. Its catch handler logs `error.message` to the server log and returns HTTP **503** with the generic message **“Server configuration is incomplete. Check deployment environment variables.”** The validation runs per API request, not as a build-time test. A successful build does not prove the environment is configured.

The first failure wins, in this exact order:

1. `DATA_STORE` equals `file` → log: `DATA_STORE=file is only supported locally.`
2. `MONGO_URI` absent or empty → log: `Missing required environment variable: MONGO_URI`
3. `JWT_SECRET` absent or empty → log: `Missing required environment variable: JWT_SECRET`
4. `ADMIN_USERNAME` absent or empty → log: `Missing required environment variable: ADMIN_USERNAME`
5. `ADMIN_PASSWORD` absent or empty → log: `Missing required environment variable: ADMIN_PASSWORD`

Although `middleware/auth.js` and `routes/authRoutes.js` provide local default credentials, the Vercel validator runs first. Those defaults **do not make either admin variable optional on Vercel**. Likewise, a randomly generated local JWT fallback is not allowed on Vercel.

**How environment loading works:** `api/index.js` exports `app.js`, which imports `config/env.js`. That module runs `dotenv.config()` against `Moe.cut/.env` **only when `VERCEL` is not truthy**. On Vercel, the backend correctly reads injected `process.env` values. `.env.example` is documentation, not a loaded configuration file. The local `.env` is ignored by Git and deliberately not loaded on Vercel. No frontend `import.meta.env` API configuration or custom Vite `loadEnv` is involved. Vercel's `VERCEL` flag is a [system environment variable](https://vercel.com/docs/environment-variables/system-environment-variables); confirm automatic system-variable exposure remains enabled.

**How to fix and verify the deployed environment:**

1. Open the Vercel project connected to `Bader7771/Moe.cut`, then **Settings → Environment Variables**.
2. Add each of the four exact uppercase names above with its actual value. Select **Production** and **Preview** where needed, plus **Development** if using the Vercel CLI locally. Save each entry. Check any Preview branch-specific overrides.
3. Remove `DATA_STORE=file` from the applicable hosted scopes. Do not add `PORT` or frontend-prefixed copies of backend secrets.
4. Open **Deployments**, select the affected deployment, and choose **Redeploy** for its intended environment. Existing deployments do not acquire newly saved values automatically. See [Vercel's environment-variable setup instructions](https://vercel.com/kb/guide/how-to-add-vercel-environment-variables).
5. Open `/api/health` on the new deployment, then try `/login`. A working database returns `{"status":"ok","storage":"mongodb"}`. If the message changes to `Database unavailable. Check MONGO_URI and database network access.`, the presence validation has passed; check the actual URI, database credentials, and network access next.
6. If the original error remains, open the project's **Logs**, select the affected deployment/environment, and retry `/api/health` to generate a fresh function invocation. Look for one of the five exact log messages above. The name after `Missing required environment variable:` is the specific first missing variable for that invocation. Fix it and redeploy; there may be more than one missing variable. Share only the error line when requesting help, never secret values.

**What is known about the current reported error:** the browser message establishes that one of the five checks above failed. It does **not** identify which one. The deployed settings and function logs were not available in this workspace, so the exact missing variable cannot be honestly determined from the browser message alone. The inspected local `.env` contains `MONGO_URI` and `PORT` only; this is not evidence of Vercel's deployed values. If only those local keys were copied to Vercel, `JWT_SECRET` would be the first missing variable, followed by both admin variables—but this is a conditional diagnosis, not a confirmed deployment finding.

Audit scope: all application `process.env` references, environment files, Vite/Vercel/package configuration, database setup, authentication/JWT, uploads, local server entry, and API runtime validation under `Moe.cut/`. Dependencies and generated build output are not the application's configuration contract. Tests use temporary environment values and do not configure deployed environments. No application functionality was changed for this documentation update.

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


## Collaborator management

Open **Admin → Collaborators** to add, edit, or delete a collaborator. Upload a JPG, PNG, WebP, or GIF up to 4 MiB, enter a name and a flexible followers value (for example `12.5K` or `100K+`), then save. Image previews and the existing delete confirmation are included. Editing can retain the current image.

`GET /api/collaborators` and `GET /api/collaborators/:id` are public; `POST`, `PUT`, and `DELETE` use the existing admin authentication. Records use the shared Mongoose/file store with timestamps and the existing upload service. Local records live in `collaborators.json` in the configured data directory; production uses MongoDB. No new storage credentials are required.

The Hero reads this API with no hardcoded fallback records. It refreshes on return to the page, after changes in another dashboard tab, and every 30 seconds while visible. Empty collections hide the collaborator strip. Temporary API failures retain the last loaded set, and failed images fall back to initials.

Run `node --test tests/collaborators.test.js` from `Moe.cut` for isolated HTTP tests of local persistence and the MongoDB route path with database doubles, including upload validation and cleanup.
