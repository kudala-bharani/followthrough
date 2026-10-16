---
doc: checklist
status: approved
---
# Build Checklist

Approved build plan. Scope, PRD, spec, build order and Git initialization are approved. Inspect staged changes for secrets/private context before every commit.

Build mode: fast, approved. Automated verification and learner hands-on review remain required.

## Slices
- [ ] **1. Track an application through a due follow-up and outcome**
  Becomes usable: Complete small local dashboard: add applications, see why seven-day Waiting records need attention, log follow-up/reply/closure, retain data, and manually back it up and restore it.
  Why now: This is one coherent end-to-end proof of concept. The explainable queue is implemented first within the slice; no unrelated scaffolding or features. A shared hands-on session can shape fixes and perform final review.
  PRD ref: `prd.md > The Core Journey`, `prd.md > Features and Behavior`, `prd.md > States and Boundaries`
  Spec ref: `spec.md > Components`, `spec.md > Data Model`, `spec.md > File Structure`, `spec.md > Important Failure Modes`
  Build: Implement the minimal browser app, pure date/model logic, storage and backup, loopback server and factual README. Keep credentials and learner context excluded; do not install paid services or publish.
  Verify (mechanical): Run node --test for validation, exactly-six/seven/eight-day boundaries, month/year/DST changes, follow-up reset, reply/closure exclusion, invalid imports, and storage failures. Start server and inspect the live core journey, reload persistence, repeated clicks, import cancellation, invalid input, keyboard focus and narrow-screen layout. Confirm private paths are not served. Disclose checks that cannot run.
  Learner check: Open the running app; add a synthetic application from at least seven days ago; inspect its reason; log a follow-up and confirm it leaves the queue; inspect All applications, change status, reload, and try a backup. Report anything broken or unclear.
  Commit: `Build FollowThrough local follow-up workflow`

## Hands-on Checkpoints
- [ ] Early usable behavior explored — shared hands-on session after the single slice; feedback can drive final revisions
- [ ] Final kick-the-tires exploration and feedback completed — same session when appropriate, no duplicate ritual

## Final Review
- [ ] Final review complete — feedback resolved, checks passed, changes committed, learner confirms ready to ship

## Code Tour and App Map
- [ ] Learning activity complete — brief project-grounded review of the seven-day date calculation and its boundary test, or another real question raised by learner
- [ ] Optional edit and transfer reflection addressed — offered/declined/already covered/not applicable recorded accurately
- [ ] `devpost/app-map.html` generated from finished code, checked and shown, with a reusable practice
Activity and evidence: Learner activity not yet performed. Agent verification: 13 node tests passed, including three time zones. Browser QA script prepared but not run successfully: Chromium sandbox socket restriction, escalated read-only runtime mount failure, and cloud-browser loopback connection refused.
Route and stops: Reference map prepared for src/app.mjs > applyRecord, src/model.mjs > logFollowUp/daysWaiting/isDue, and src/storage.mjs > save plus app render. Corresponding test: queue has precise six, seven, and eight day boundaries.
Edit outcome: Not yet offered or performed.
Reflection: Not yet offered; personal answer belongs only in the ignored profile.
Activity mode: Proposed focused alternative for an experienced plan-first learner; no mastery assumed.

## Revisions
- Implemented the approved workflow and all 13 mechanical tests pass. Slice remains unchecked because browser verification and the planned hands-on checkpoint remain open. No final build completion claim.
- Added an optional generated one-file preview for easier local access. Canonical local-server behavior is unchanged; file-URL storage variability is disclosed.
- Browser verification could not run due to execution-environment restrictions. Preserve the prepared qa/browser-check.cjs script for a supported environment; this is a blocker, not a passing result.

## Approval Record
Approved 2026-10-15, in dependency order: scope → product requirements → technical approach → build order and fast mode. Git initialization approved. The displayed bundled plan was accepted; implementation and agent checks may proceed. Learner hands-on review and final readiness remain open.
