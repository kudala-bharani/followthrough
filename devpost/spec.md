---
doc: spec
status: approved
---
# FollowThrough — Technical Spec

Approved technical plan based on prd.md.

## How This Works, In Plain Language
A small page runs in the browser. It stores the application list in that browser, calculates which Waiting applications have reached seven days, and shows why each is due. No server stores applications, and no API key or paid service is needed. Manual JSON backup is proposed because browser data can be cleared; it is not automatic cloud backup.

## The Core Journey Through the System
Form input passes validation, then updates a versioned local list. The queue calculation derives due records from that list and today's date. Rendering shows the selected view. Outcome buttons update a record, save successfully, then refresh the display. Implements prd.md > The Core Journey.

## Stack
Approved: plain HTML, CSS, and JavaScript, with no third-party runtime dependencies. Browser localStorage stores small data. Node.js built-ins provide a local static server and automated tests, without npm packages. No build step.
Documentation: https://developer.mozilla.org/en-US/docs/Web/HTML ; https://developer.mozilla.org/en-US/docs/Web/CSS ; https://developer.mozilla.org/en-US/docs/Web/JavaScript ; https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage ; https://nodejs.org/api/test.html ; https://nodejs.org/api/http.html

## Where It Runs and How Someone Tries It
Commands from the project root: node server.mjs, then open http://localhost:4173. Tests: node --test. Confirm an installed supported Node version before implementation; do not claim verification until commands run. Use a consistent origin/port so local storage remains accessible. A modern desktop browser is the primary demo target; narrow-screen and keyboard flows are checked too. No deployment planned. A public repo and short demo remain later submission requirements.

## Look and Feel
Implement prd.md > Look and Feel with CSS custom properties, system fonts, semantic forms/buttons, visible keyboard focus, adequate contrast, and responsive cards. No remote assets.

## Components
### Application Model and Queue
Pure functions validate records, calculate local calendar-day differences using normalized year/month/day values, derive due reasons, and apply outcome updates. Avoid subtracting raw local timestamps across daylight-saving changes. Implements prd.md > Application Entry and Status, Explainable Follow-up Queue, and Record an Outcome.
### Dashboard and Form
DOM rendering and form/event handling. Insert user strings via textContent, not interpolated HTML. Re-render relevant views without losing needed focus. Implements prd.md > Screens and Layout and States and Boundaries.
### Storage and Backup
Versioned localStorage envelope; validate before use; catch read/write failures. Export a JSON download. Validate entire import, preview count, and request replacement confirmation before saving. Never overwrite malformed saved data automatically. Implements prd.md > Local Save and Backup.
### Local Server
Node built-in HTTP static server limited to project public files, bound to loopback. Reject path traversal and avoid exposing devpost/learner-profile.md, credentials, or repository metadata.

## Data Model
Envelope: schemaVersion: 1 and applications array. Each record: generated unique id, company, role, appliedDate (YYYY-MM-DD), status (waiting/replied/closed), lastFollowUpDate (null or YYYY-MM-DD). Persist in a namespaced key. Validate field types, lengths, valid dates, duplicate IDs, and supported schema version. Reject future dates and follow-ups before application dates. Use synthetic records in tests and demos.

## File Structure
- index.html: accessible dashboard shell
- styles.css: responsive visual design
- src/model.mjs: pure validation, date and queue functions
- src/storage.mjs: persistence and backup validation
- src/app.mjs: DOM events and rendering
- server.mjs: loopback static server
- test/*.test.mjs: Node built-in tests
- README.md: factual setup, privacy, backup and testing instructions
- devpost/: scope, PRD, spec, checklist and later app map; personal profile remains ignored
- .gitignore: privacy exclusions

## External Services and Dependencies
None at runtime. No backend, remote database, analytics, CDN, or API calls. Additional service spend: $0. Existing coding-agent access remains subject to its own usage limits.

## Important Failure Modes
- localStorage blocked/full: actionable save error; no false success
- Invalid stored/imported JSON: preserve existing data; reject replacement
- DST/date boundary: calendar-day tests cover exact seven-day boundary and daylight-saving transitions

## What Was Simplified and Why
Manual entry instead of email integrations; a single-browser list instead of accounts/sync; local demo instead of hosted infrastructure. Each preserves the core demonstration without costs or credential handling.

## Decisions and Open Issues
Stack/localStorage and backup tradeoff approved. Routine file organization and implementation details are derived proposals. No learner uncertainty has been identified; do not fabricate one. Git initialization and fast build mode approved. Technical documentation is allowed; no user submission prose will be authored.

## Approval Record
Approved 2026-10-15, in dependency order: scope → product requirements → technical approach → build order and fast mode. Git initialization approved. The displayed bundled plan was accepted; implementation and agent checks may proceed. Learner hands-on review and final readiness remain open.
