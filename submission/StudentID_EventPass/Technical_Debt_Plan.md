# Technical Debt Plan

## 1. Purpose

This project was implemented under a 48-hour exam constraint. Some technical debt is intentionally accepted to prioritize correctness and delivery. This plan identifies major debt items, their impacts, and future remediation priorities.

## 2. Debt register

| Debt item                              | Cause                             | Impact                                      | Priority | Proposed resolution                          |
| -------------------------------------- | --------------------------------- | ------------------------------------------- | -------- | -------------------------------------------- |
| SQLite-only architecture               | Fast setup under exam constraints | Limited scale and enterprise readiness      | Medium   | Migrate to PostgreSQL in future versions     |
| No capacity enforcement                | Time pressure and scope limit     | Overbooking possible                        | High     | Add validation logic and warning rules       |
| Single organizer role                  | Simplified permissions model      | Limited multi-user workflows                | Medium   | Add staff roles and access control           |
| No email verification / password reset | Scope reduction                   | Lower operational maturity                  | Medium   | Add account recovery and email verification  |
| No rate limiting                       | Security simplification           | Vulnerable to brute-force attempts          | High     | Implement rate limiting and lockout policies |
| Basic error handling                   | Time constraint                   | Some API outcomes are intentionally minimal | Medium   | Improve structured validation and monitoring |
| Limited documentation                  | Tight exam deadline               | Requires more onboarding effort             | Medium   | Expand docs and runbooks                     |

## 3. Classification

Acceptable temporary debt:

- SQLite chosen for simplicity
- single organizer role
- minimal authentication policies

Scheduled for future resolution:

- multi-role access management
- ticket notification workflows
- enhanced reporting

Critical and requiring immediate attention:

- capacity enforcement
- rate limiting / auth hardening

## 4. Repayment plan

- Version 2.0: add role-based access and capacity validation
- Version 2.1: security hardening and rate limiting
- Version 2.2: analytics/reporting and improved UX
- Version 3.0: scale migration to PostgreSQL and broader deployment support
