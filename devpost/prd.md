---
doc: prd
status: approved
---
# FollowThrough — Product Requirements

A local job-application tracker that explains which applications need a follow-up. Source: scope.md > The Unique Kernel and The Core Loop.

## The Core Journey
1. Open the clean dashboard and add a company, role, application date, and status.
2. View applications waiting at least seven days in Follow-up, with a plain-language reason and waiting time.
3. Record a follow-up to restart the seven-day clock, or record a reply/closed status to remove that application from the queue.
4. Use All applications to inspect and update the full list. Return later to the same browser to continue.

## Screens and Layout
One dashboard with Follow-up and All applications views, an accessible application form, and readable application cards. No separate onboarding or account screens. Responsive layout adapts to narrow screens without horizontal scrolling.

## Look and Feel
The learner accepted a clean dashboard and delegated routine design choices. Implementation proposal: calm light background, readable system fonts, restrained blue accent, strong focus outlines, clear due-date badges. These specifics are assistant-selected implementation details, not reported personal preferences.

## Features and Behavior
### Application Entry and Status
Company and role are required nonblank text. Application date is a valid calendar date, not in the future. Statuses: Waiting, Replied, Closed. Users can update status; records remain visible in All applications after leaving the queue. No destructive delete flow is needed for this proof of concept.

### Explainable Follow-up Queue
Only Waiting records are eligible. A record is due when seven or more local calendar days have passed since its application date or latest recorded follow-up, whichever is later. Each due record states the elapsed days and whether its clock began at application or follow-up. Sort longest waiting first. Exactly seven days is due; six days is not.

### Record an Outcome
Log follow-up records today's local date and restarts the wait. Mark replied or closed removes the record from Follow-up and preserves it in All applications. Returning to Waiting uses the existing application/latest-follow-up anchor; it does not invent contact history. Disable or hide follow-up actions for non-Waiting records.

### Local Save and Backup
Approved: retain records in this browser only and clearly explain that clearing browser data can erase them. Add manual JSON export and validated import as a minimal safeguard. Import previews the record count and replaces current data only after explicit confirmation; cancelling or invalid input changes nothing. No data leaves the browser through the app.

## States and Boundaries
- First use: empty state invites adding an application; do not silently populate fake records
- No due applications: show a positive empty state and a route to All applications
- Invalid entry: show a field-associated error; preserve user input
- Storage failure: show that changes could not be saved; never claim persistence succeeded
- Corrupt saved/imported data: preserve it and show an actionable error, never silently overwrite it
- Privacy: no accounts, external fonts, analytics, inbox access, or paid APIs

## Product Decisions
Accepted: FollowThrough name; clean dashboard; Follow-up and All applications views; seven-day wait reset after logging follow-up; replied/closed applications leave the queue. Routine visual choices delegated. Backup, statuses, calendar-day calculation, validation, and import behavior are approved.

## What We're Building
The core journey and safe local persistence, plus the proposed manual backup safeguard. Traceability: scope.md > What "Working" Looks Like and The POC Boundary.

## Deferred From the POC
Email sending, inbox integrations, accounts, multi-device sync, paid services, notifications, and hosting. These are unnecessary to prove the local attention queue and conflict with the intended small $0 scope.

## Open Questions
Product definition and backup safeguard approved. No new learning goal is assumed. Public publication and final submission are separate later actions.

## Approval Record
Approved 2026-10-15, in dependency order: scope → product requirements → technical approach → build order and fast mode. Git initialization approved. The displayed bundled plan was accepted; implementation and agent checks may proceed. Learner hands-on review and final readiness remain open.
