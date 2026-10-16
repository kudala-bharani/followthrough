---
doc: scope
status: approved
---
# FollowThrough

A small local app that helps a job seeker see which applications need a follow-up.

## The Unique Kernel
A queue highlights applications that have been waiting at least seven days and explains why each appears. The agreed waiting interval is seven days.

## Who It's For
A job seeker managing their own applications and deciding which ones need attention. The exact current tracking method has not been established.

## The Core Loop
add a company, role, application date, and status; return to see applications waiting at least seven days and the reason each needs attention; record a reply or follow-up, or update the status.

The precise effect of recording a follow-up on the next due date will be resolved during product planning, rather than silently assumed here.

## Inspiration & Identity
The learner accepted the name FollowThrough and a clean dashboard, delegating routine visual choices. No external visual references were supplied.

## Why This Matters to the Learner
The learner accepted the suggested job-application tracker direction and seven-day interval. Their personal motivation and desired learning outcome have not yet been established; no additional motivation is assumed.

## What "Working" Looks Like
Demonstration: enter an application with a date at least seven days earlier, see it in the attention queue with an understandable reason, then record a response or update its status and see the resulting change. A recently entered application should not appear as overdue solely because it was entered today.

The detailed status rules and follow-up reset behavior remain for the PRD.

## The POC Boundary
manual application entry; company, role, application date, and status; the seven-day waiting queue with reasons; recording a reply or follow-up and updating status. Browser-local use without an account, email integration, or additional spending. Local persistence is proposed and subject to technical-plan agreement.

The learner's firm budget is $0 additional spending. Build fresh for this challenge; do not reuse prior project code.

## Later
No later features have been requested. Do not invent a roadmap or expand the proof of concept.

## Explicitly Cut
Excluded from this proof of concept:
- Accounts and shared cloud data: unnecessary for the small personal workflow
- Sending email or connecting an inbox: unnecessary to demonstrate the attention queue
- Paid APIs, subscriptions, and hosting: incompatible with the $0 additional-spending constraint
- Deployment: optional for the challenge and unnecessary for a local working demonstration

## Review State
Scope approved. Dependent PRD, technical specification, and build checklist are now approved. See their approval records.
