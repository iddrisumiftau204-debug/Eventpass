# EventPass — Project Documentation

## 1. Project title

EventPass — Event Ticketing & Check-in System

## 2. Problem statement

Event organizers often need a lightweight way to manage attendees, generate unique ticket codes, and perform fast check-ins at event entrances. Existing solutions can be too heavy, require complex infrastructure, or lack a simple, organizer-focused workflow. EventPass addresses this problem by providing a compact web-based system for event creation, attendee registration, QR-based ticketing, and rapid door check-in.

## 3. Aim and objectives

Aim:
To design and implement a deployable, secure, and user-friendly event ticketing and check-in application for a small organizer.

Objectives:

- allow organizers to create and manage events
- register attendees and assign unique ticket codes
- generate QR codes for each ticket
- support fast check-in using ticket codes
- enforce data isolation between organizers
- provide a responsive and scalable solution within the 48-hour exam window

## 4. Stakeholders

- Event organizers
- Event staff / check-in desk personnel
- Attendees
- Course examiner and teaching staff
- Project owner / developer

## 5. Requirements analysis

Functional requirements:

- Organizer registration and login
- Event creation, listing, update, and deletion
- Attendee registration per event
- Unique ticket code generation
- Ticket lookup and check-in
- Duplicate prevention for same email within same event
- Concurrency-safe check-in logic
- Event statistics display

Non-functional requirements:

- secure authentication via JWT
- isolation of organizer data
- fast and keyboard-friendly check-in flow
- unique, legible ticket code format
- simple SQLite-based setup for local development

## 6. SRS summary

The system is scoped to a single organizer role with no attendee self-service. The software prioritizes correctness of check-in logic and data privacy. The product is intentionally small enough for completion within a 48-hour period while still demonstrating a full software lifecycle.

## 7. Software effort estimation

Selected technique: Expert estimation informed by use-case scope and implementation risk.

Reason for selection:
This project is a focused academic system with a short timeline and a small team of one developer. Expert estimation is appropriate because the system is small but includes a concurrency-critical check-in workflow that requires careful design and validation.

Estimated effort:

- Total development effort: 40–50 person-hours
- Core implementation: 28–32 hours
- Testing and bug fixing: 8–10 hours
- Documentation and deployment setup: 6–8 hours

Estimated duration:

- 2–3 days equivalent, within 48-hour exam window

Assumptions:

- one developer
- use of existing libraries and standard frameworks
- SQLite is acceptable for local deployment
- no large-scale multi-user or payment features

Constraints:

- limited time for full production hardening
- no external enterprise infrastructure
- no admin hierarchy or advanced permissions

Influence on scope:
The project intentionally excludes payment processing, attendee self-registration, email delivery workflows, and broader role-based access systems.

## 8. System analysis

The application follows a simple layered architecture:

- frontend React SPA
- backend Express API
- SQLite database

The core business process is: organizer creates event -> registers attendees -> generates ticket codes -> staff checks in attendees by code.

## 9. System design

Architecture:

- Front-end: React + Vite
- Back-end: Node.js + Express
- Database: SQLite via better-sqlite3
- Authentication: JWT bearer tokens
- QR generation: qrcode library

Key design decisions:

- separation of concerns between routes, middleware, and data access
- ownership scoping by organizer ID for all event and attendee operations
- atomic SQL update for check-in correctness under concurrency

## 10. Implementation

Implementation covered the core requirements:

- user auth
- event management
- attendee registration and tickets
- QR generation
- check-in screen
- event stats

## 11. Testing

The backend test suite validates the unique ticket code generation and the concurrency-critical check-in flow. All tests passed in the local environment after dependency installation.

## 12. Technical debt

The project includes deliberate technical debt items that are acceptable for a time-boxed academic project. See the dedicated technical debt plan document for details.

## 13. Deployment

The project includes a Render blueprint configuration and deployment instructions. The local environment was validated with backend tests and frontend build success.

## 14. User manual

See the User Manual document in this submission package.

## 15. Maintenance strategy

- corrective maintenance for bugs and failed validations
- adaptive maintenance for framework/database updates
- perfective maintenance to improve UX and reporting
- preventive maintenance through testing and security review

## 16. Future evolution

Potential future enhancements:

- role-based access control for staff users
- paid ticketing and payment gateway
- attendee self-service portal
- email/SMS ticket delivery
- analytics dashboard and reporting
- migration from SQLite to PostgreSQL for scale

## 17. Limitations

- no multi-admin support
- no capacity enforcement checks
- no attendee-facing portal
- no advanced security controls such as rate limiting and email verification
- SQLite is sufficient for exam scope but not enterprise scale

## 18. Conclusion

EventPass demonstrates sound software engineering practice under a constrained time window. It includes requirements analysis, design, implementation, testing, and deployment preparation while maintaining a focused scope appropriate for the 48-hour exam.

## 19. References

- Node.js documentation
- Express documentation
- React and Vite documentation
- SQLite documentation
- Project source code and repository files
