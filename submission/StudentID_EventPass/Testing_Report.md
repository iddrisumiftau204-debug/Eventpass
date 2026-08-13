# Testing Report

## 1. Test strategy

The project used a combination of backend unit and integration tests plus manual validation. The most important test was the concurrency check-in case because it directly validates the correctness of the critical business rule.

## 2. Test cases

| Test case                       | Expected result                               | Actual result                      | Pass/Fail |
| ------------------------------- | --------------------------------------------- | ---------------------------------- | --------- |
| Generate unique ticket code     | 7-character code with no ambiguous characters | Matches expected format            | Pass      |
| Valid ticket check-in           | HTTP 200 and timestamp returned               | HTTP 200 returned                  | Pass      |
| Duplicate check-in              | Second attempt returns 409                    | 409 returned                       | Pass      |
| Unknown ticket code             | HTTP 404 with NOT_FOUND                       | HTTP 404 returned                  | Pass      |
| Concurrent check-ins            | Exactly 1 success and 4 conflicts             | 1 success and 4 conflicts observed | Pass      |
| Duplicate attendee registration | 409 DUPLICATE_EMAIL                           | 409 returned                       | Pass      |

## 3. Test execution evidence

Executed command:

```bash
cd /Users/shafiu/Documents/projects/Eventpass/backend && npm test -- --runInBand
```

Observed output:

- 2 test suites passed
- 7 tests passed
- 0 failed

## 4. Defects identified and corrective actions

No defects were found in the verified core workflow after dependencies were installed. The project remained within the exam scope and no critical blocker remained after validation.

## 5. System validation

Frontend build validation was also performed:

```bash
cd /Users/shafiu/Documents/projects/Eventpass/frontend && npm run build
```

Result:

- Vite production build succeeded
- No build errors were reported
