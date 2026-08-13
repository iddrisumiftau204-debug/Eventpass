# User Manual

## 1. Overview

EventPass is a simple event ticketing and check-in system for organizers and event staff.

## 2. Getting started

1. Open the frontend application.
2. Register a new organizer account.
3. Log in using the registered email and password.
4. Create an event.
5. Add attendees to the event.
6. Use the generated ticket code or QR code at check-in.

## 3. Organizer actions

### Register

Use the registration page to create an organizer account.

### Create event

From the dashboard, enter the event name, date, and optional venue/capacity.

### Add attendees

Select an event and add attendees by name and email. The system will generate a unique ticket code automatically.

### View statistics

Open the event detail page to see totals and check-in percentage.

### Check in attendee

Use the check-in page and enter the attendee ticket code or scan the QR code.

## 4. Staff check-in flow

1. Navigate to the check-in screen.
2. Scan or type the ticket code.
3. If valid and unused, the system marks the attendee as checked in.
4. If the ticket is already checked in, the system returns a duplicate-check-in warning.

## 5. Error messages

- Duplicate registration: email already exists for the event
- Invalid ticket: code not found
- Duplicate check-in: ticket already checked in

## 6. Security notes

- Use a strong password for organizer accounts.
- Keep JWT credentials secure.
- Do not share the organizer token outside the application environment.

## 7. Known limitations

- No attendee self-service portal
- No online payment module
- No multi-admin role management
