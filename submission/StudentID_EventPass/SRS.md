# Software Requirements Specification (SRS)

## 1. Introduction

EventPass is a web application for event organizers to manage event attendance. The application allows organizers to create events, register attendees, assign ticket codes, and perform entry check-ins using a simple scan-or-type workflow.

## 2. Product perspective

The product is a single-tenant event management system targeted at a single organizer. It is not intended to replace large commercial event management platforms, but rather to demonstrate disciplined software engineering under a constrained time window.

## 3. User classes

- Organizer: registers, creates events, manages attendees, checks in attendees
- Staff member: uses the check-in screen to validate ticket codes
- Attendee: receives a ticket code or QR from the organizer

## 4. Functional requirements

FR1. The system shall allow a user to register an account with name, email, and password.
FR2. The system shall allow a user to log in and receive a JWT token.
FR3. The system shall allow an organizer to create an event with a name and date.
FR4. The system shall allow an organizer to list, view, update, and delete only their own events.
FR5. The system shall prevent duplicate attendee registration for the same email within the same event.
FR6. The system shall assign each attendee a unique ticket code.
FR7. The system shall allow ticket lookup by code.
FR8. The system shall allow ticket check-in only once per code.
FR9. The system shall display event statistics including registered attendees, checked-in attendees, and percentage checked in.
FR10. The system shall generate a QR code for each attendee ticket.

## 5. Non-functional requirements

NFR1. Check-in correctness under concurrency must be preserved.
NFR2. Each organizer must only access their own data.
NFR3. The system should be easy to run locally with minimal setup.
NFR4. The check-in screen must support fast keyboard/scanner input.
NFR5. Ticket codes should avoid ambiguous characters.

## 6. Requirements prioritization

Priority 1 (must-have):

- registration/login
- event creation and management
- attendee registration
- ticket generation
- duplicate protection
- check-in logic

Priority 2 (should-have):

- statistics dashboard
- QR display
- print-friendly ticket view

Priority 3 (nice-to-have):

- email notifications
- payment integration
- advanced analytics

## 7. Scope

Within the 48-hour constraint, the project includes the essential path from event creation to check-in. It excludes broad enterprise capabilities not necessary for the exam objectives.

## 8. Acceptance criteria

- unique ticket codes are generated correctly
- duplicate attendee registration for the same event is rejected
- same ticket code cannot be checked in twice
- concurrent check-in attempts succeed only once
- event statistics are displayed correctly
