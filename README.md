# Moe.cut — admin login and running the project

- **Username:** `aflaton-skimo`
- **Password:** `skimo7777`
- **Website:** http://127.0.0.1:5173
- **Admin login:** http://127.0.0.1:5173/login
- Click **ADMIN** in the footer to open the username/password login page. Successful login opens `/admin`, where you can create, edit, and delete projects and testimonials. Logout returns to login.

From the repository root:

```sh
npm --prefix Moe.cut install
npm run dev
```

This starts the frontend on port **5173** and the backend on port **5001**. Keep the terminal open; use Ctrl+C to stop both. For a built version served by one process, run `npm start` and open http://localhost:5001.

## Backend fixes and storage

The previous API displayed read-only sample projects when MongoDB failed, while all create/edit/delete actions still required MongoDB. Local root commands now explicitly use persistent file storage, so all dashboard actions work without installing MongoDB.

- Local projects and testimonials are stored in `Moe.cut/storage/`. The six sample projects are added only when the project storage file does not yet exist. Updates and deletions survive restarts, including deleting all projects. Local testimonials start empty; existing MongoDB content is not imported or changed.
- Uploaded images are saved in `Moe.cut/uploads/`. Both API requests and uploads are proxied correctly during development. Back up these two directories to preserve local content.
- Project and testimonial writes require a valid admin token. The dashboard validates the session before displaying content. Sessions expire after 10 hours; without `JWT_SECRET`, restarting the backend also requires logging in again.
- Both backend copies (`Moe.cut/` and `backend/`) include the same route and persistence fixes. Root commands use `Moe.cut/` only; do not start both backends on port 5001.

## MongoDB and hosted environments

To use MongoDB, start the backend directly instead of using the root local-storage commands:

```sh
npm --prefix Moe.cut run build
npm --prefix Moe.cut start
```

Configure `Moe.cut/.env` (or the hosting environment) with `MONGO_URI`, `JWT_SECRET`, and optionally `PORT`, `ADMIN_USERNAME`, and `ADMIN_PASSWORD`. Leave `DATA_STORE` unset for MongoDB. A database connection failure now produces an explicit error instead of displaying sample data that cannot be edited.

The requested credentials are the defaults; environment variables can override them. Set a persistent `JWT_SECRET` for hosted use. File storage requires a persistent writable server disk and a single backend process. Vercel deployments need MongoDB and an external persistent image-upload service; local filesystem uploads are not suitable for Vercel. These changes have been run locally, not deployed to a live website.

## Verification

```sh
npm run build
npm --prefix Moe.cut run lint
node scripts/check-storage.mjs
# With npm run dev running:
node scripts/check-api.mjs
```

The storage check uses an isolated temporary directory and verifies edits/deletes across process restarts. The API check creates and deletes temporary records and checks login, rejected credentials/tokens, protected writes, project/testimonial CRUD, uploaded images, and the login route. Uploaded test images remain in the uploads directory.
