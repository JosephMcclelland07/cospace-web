# CoSpace Booking Test Design

## Scope note

These cases are based on behavior currently visible in the CoSpace UI and routes. They are not evidence of formal product approval. In particular, successful creation currently adds a booking to the page's local state; persistence across reloads is not established. The detail route currently uses three mock bookings.

## Risk Ranking

| Rank | Area | What could fail | Who is affected and why it matters |
| --- | --- | --- | --- |
| 1 | Booking creation form | Valid details could be rejected, invalid details accepted, or the UI could report success without saving beyond the current page. | Anyone trying to reserve a desk; a false success could leave them believing they have a booking when the current implementation has only updated local page state. |
| 2 | API data loading | The request could fail, return an unexpected payload, or show the wrong booking data. | Dashboard users; they may be unable to see or search bookings. The New booking action is also disabled while loading and when a fetch error is present. |
| 3 | Modal open and close behaviour | The form might not open, the close control or Escape might fail, or keyboard focus might not remain usable and return to the opener. | Anyone creating a booking, especially keyboard users; they could be unable to reach or leave the form. |
| 4 | Booking details route | A known ID might show the wrong booking, or an unknown ID might not show the not-found state. The current route uses mock records. | Someone inspecting a specific booking; incorrect details could lead them to act on the wrong booking. |
| 5 | Dashboard table | Column headings, row values, status, or the empty state could be misleading. | People relying on the table to identify bookings. Current caveat: the dashboard route renders BookingList, not BookingsTable, so the table is not presently in that route's active flow. |

## Boundary Value Analysis

Hold all other form fields at valid values for each case. For date cases, define yesterday/today/tomorrow relative to the browser's local current date, matching the form's current-date comparison.

| Case | Field and value | Expected visible outcome |
| --- | --- | --- |
| BVA-01 | Desk = 0 (below minimum 1) | Validation feedback; no booking is added. |
| BVA-02 | Desk = 1 (minimum) | Form accepts the value when the other fields are valid. |
| BVA-03 | Desk = 2 (immediately above minimum) | Form accepts the value when the other fields are valid. |
| BVA-04 | Floor = -1 (below minimum 0) | Validation feedback; no booking is added. |
| BVA-05 | Floor = 0 (minimum) | Form accepts the value when the other fields are valid. |
| BVA-06 | Floor = 1 (immediately above minimum) | Form accepts the value when the other fields are valid. |
| BVA-07 | Date = yesterday | Validation feedback; no booking is added. |
| BVA-08 | Date = today | Form accepts the value when the other fields are valid. |
| BVA-09 | Date = tomorrow | Form accepts the value when the other fields are valid. |

No string-length boundary is established by the visible form rules, so no length boundary is asserted here.

## Equivalence Partitions

Use one representative per listed group. The expected result is form feedback and no list addition for invalid groups, and a success status plus a visible local list item for valid groups.

| Field | Valid representative | Invalid representatives |
| --- | --- | --- |
| Desk | `1` (whole number at least 1) | Empty; `1.5` (not a whole number); `9007199254740992` (not a safe integer). The below-minimum class is covered by BVA-01. |
| Floor | `0` (whole number at least 0) | Empty; `1.5` (not a whole number); `9007199254740992` (not a safe integer). The below-minimum class is covered by BVA-04. |
| Date | Today (valid calendar date, not in the past) | Empty; yesterday (past date, also covered by BVA-07). |

The visible date input is a date control, so malformed typed date strings are not included as manual UI cases. The form's internal validator checks date format/calendar validity, but those cases are better exercised directly in a component or unit test if needed.

## Decision Table: Form Conditions

Use a valid representative for each condition marked Valid and an invalid representative for each marked Invalid. Keep each row as a separate form submission and verify whether a new list item appears.

| Case | Desk | Floor | Date | Expected visible outcome |
| --- | --- | --- | --- | --- |
| DT-01 | Valid | Valid | Valid | Success status; new booking appears in the current list. |
| DT-02 | Invalid | Valid | Valid | Desk validation feedback; no booking is added. |
| DT-03 | Valid | Invalid | Valid | Floor validation feedback; no booking is added. |
| DT-04 | Valid | Valid | Invalid | Date validation feedback; no booking is added. |
| DT-05 | Invalid | Invalid | Invalid | Validation feedback for all invalid fields; no booking is added. |

DT-02 through DT-04 isolate each condition; DT-05 checks that all three invalid conditions can be reported together. The form's visible field labels are Desk, Floor, and Date.

## Other Manual Cases

| Area | Case | Expected visible outcome |
| --- | --- | --- |
| API loading | Return a valid response containing bookings. | Loading ends and the mapped booking cards and booking count are visible. |
| API loading | Return an empty bookings collection. | The list shows "No bookings found." |
| API loading | Make the API unavailable. | The list shows its unavailable error state and New booking is disabled. |
| API loading | Return a malformed response. | The list shows its unexpected-response error state. |
| Search | Search for a desk value present in a booking. | Matching booking(s) remain visible; non-matching bookings are hidden. |
| Search | Search for `FLOOR 2`, with bookings on more than one floor. | Only matching Floor 2 bookings remain visible, demonstrating case-insensitive matching. |
| Search | Search for a date value present in a booking. | Matching booking(s) remain visible. |
| Search | Search for a value that matches no booking. | The list shows "No bookings match your search." |
| Detail route | Visit `/bookings/booking-1`. | Booking details, ID `booking-1`, Desk A12, Floor 1, date 2026-10-02, and Active status are visible. |
| Detail route | Visit `/bookings/unknown`. | "Booking not found" and the "Back to home" link are visible. |
| Dashboard table | Provide rows with Active and Inactive bookings. | Desk, Floor, Date, and Status headings align with their row values and statuses. |
| Dashboard table | Provide no rows. | The table shows "No bookings to display." |
| Modal | Select "New booking" when the list is available. | The Create booking dialog and its form are visible. |
| Modal | Select the Close control or press Escape. | The dialog closes and focus returns to the control that opened it. |
| Modal | Use Tab and Shift+Tab at the ends of the dialog's focusable controls. | Focus cycles within the dialog. |

The Dashboard table cases apply to BookingsTable itself; the current dashboard route displays BookingList instead.

## Critique of the Existing Gherkin Scenarios

- Add the boundary values in BVA-01 through BVA-09. The current form scenario includes below-minimum values and valid values but not the immediate above-boundary values or a date immediately around today on both sides.
- Add decision-table cases DT-02 through DT-04. The current invalid submission makes Desk, Floor, and Date invalid together, so it cannot show that each condition is handled independently.
- Add search cases for desk, date, and no matches. The current search scenario covers only floor matching.
- The existing form scenario combines rejection and successful correction in one scenario. This is not an exact duplicate, but separating those outcomes would make failures easier to locate and cases easier to rerun independently.
- Keep test dates relative to today, and provide deterministic fixtures for `booking-1`; otherwise the examples depend on the current date and the route's hard-coded mock data.
- Do not assert persistence after reload until that behavior is confirmed and implemented. The current success message only confirms the local UI flow.
