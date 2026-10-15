# FollowThrough — local technical guide

A small browser-local job application follow-up tracker. No account, service, API key, package installation, or paid dependency is required.

## Run

Use Node.js 22 or newer (verified with Node 24.19.0).

1. Extract the project ZIP and open a terminal in the extracted folder.
2. Run `node server.mjs`.
3. Open `http://127.0.0.1:4173` in a modern browser.
4. Stop the server with Ctrl+C when finished.

Keep using the same browser profile and exact address. Browser storage belongs to an origin: switching between localhost and 127.0.0.1, changing ports, or switching profiles shows a separate list.

### Quick one-file preview

Open `FollowThrough-preview.html` in a desktop browser. It bundles the same CSS and JavaScript without external requests. File-URL storage behavior varies by browser; moving or renaming the file can change the stored list, and some browsers block storage. The local-server route above is the supported persistent workflow. Do not use a document viewer to test the app. Refresh the preview after source changes with `node tools/build-preview.mjs`.

## Try the core journey

- Add an invented company and role with an application date at least seven days ago and status Waiting.
- See it in Follow up, including the elapsed days and reason.
- Choose Log follow-up. It should leave the queue and remain in All applications, with a new due date seven days from today.
- Mark replied or closed, then reload. Confirm the saved status remains.
- Download a backup. Import it, cancel once, then import again and confirm replacement.
- Try a blank company, a future date, and keyboard-only navigation. Report broken or unclear behavior before final readiness is recorded.

The initial app is deliberately empty. Test names and dates are invented.

## Date and status rules

Only Waiting records are due. A reminder becomes due after seven **calendar** days, anchored to the application or last follow-up date. UTC-normalized calendar components avoid daylight-saving elapsed-hour errors. Exactly seven days is due; six is not. Logging a follow-up records today's local date. Replied and Closed records stay in All applications but leave the queue. Marking Waiting again uses the existing contact history.

## Data and privacy

Applications are stored under `followthrough.applications.v1` in localStorage. Nothing is sent to a server, and there are no remote fonts, analytics, or API calls. Data is not encrypted and is accessible to people using the same browser profile. Clearing browser data may erase it. Export JSON backups regularly and keep those files private.

Import is validated as a complete version-1 backup, previews its count, and replaces the current list only after confirmation. Invalid imports do not alter the saved list. When stored data is unreadable, normal edits pause rather than overwrite it. A valid backup may be imported to recover; first preserve unreadable data through browser developer tools if needed. Failed saves do not apply changes to the in-memory list.

The server listens only on loopback and serves an exact allowlist. Private project context, Git metadata, and arbitrary paths are not served. No deployment or public repository has been created.

## Verification

Run `node --test` for dependency-free automated checks. The 13 tests passed in the default environment and America/Los_Angeles, Europe/London, and Pacific/Auckland: date boundaries, leap/month/year/DST cases, outcomes, malformed backups, storage failures, and server path/privacy protection.

Browser QA script: `qa/browser-check.cjs`. It requires an **existing** Playwright installation and Chromium; neither is a runtime dependency. Set `PLAYWRIGHT_MODULE` to its module path and `CHROMIUM_PATH` to Chromium if necessary, then run it while the server is running. It exercises UI entry, reload, outcomes, backup download, rejected/cancelled/confirmed imports, literal text rendering, storage corruption/quota errors, keyboard focus, and 390px layout.

Browser QA has **not passed** in this environment: Chromium launch was blocked by sandbox socket restrictions; the escalated launch hit a read-only runtime mount error; the separate cloud browser could not reach the workspace loopback port. The script is prepared, not evidence of a successful browser run. No screenshots or visual-QA claims are included. Learner hands-on testing and final review are pending.

## Code orientation

- `src/model.mjs`: validation, seven-day calculation, and status logic
- `src/storage.mjs`: validated browser storage reads and writes
- `src/app.mjs`: safe DOM rendering, forms, outcomes, backup/import and focus handling
- `index.html` and `styles.css`: semantic page, dialogs, and responsive styling
- `server.mjs`: allowlisted loopback static server
- `test/model.test.mjs`: mechanical evidence
- `devpost/app-map.html`: offline technical reference route, also served at `/app-map.html`

The generated preview is a convenience copy. Modify the source files, then regenerate it. The app map is a snapshot, not a claim of completed learner review or challenge submission.
