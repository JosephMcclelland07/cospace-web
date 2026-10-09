# CoSpace Manual Test Run

**Run date**: 2026-10-08
**Environment**: VS Code integrated browser on macOS; Chromium 150 / Electron 43; CoSpace web 0.1.0, Next.js 16.3.8.
**Services**: Frontend at `http://localhost:3000`; `GET /bookings` returned HTTP 200 with one booking (Desk 1, Active).

### BUG-001: Newly created bookings have no detail link

**Severity**: Medium
**Priority**: P2
**Reproducibility**: 2/2 new bookings checked (Desk 23 and Desk 27).
**Evidence**: Neither new booking card linked to `/bookings/`; the detail route only showed the hard-coded `booking-1` record.

**Preconditions**: The user is viewing the CoSpace booking dashboard and the booking list has loaded.

**Steps to Reproduce**:
1. Navigate to the booking dashboard.
2. Select “New booking”.
3. Enter Desk `23`, Floor `3`, and Date `2026-10-09`.
4. Select “Add booking” and wait for “Booking created successfully.”
5. Try to open the new booking from its card.

**Expected Result**: The new booking links to its matching detail page.

**Actual Result**: The card is not a link, and the matching detail page cannot be opened from it. The hard-coded `booking-1` route shows a different mock record.

**Suggested Fix**: Link each booking to a detail route that resolves the same booking. The persistence contract still needs a product decision.

### BUG-002: Closing the modal during save may discard the booking

**Severity**: Medium
**Priority**: P2
**Evidence**: The form displays a saving state, but the modal Close control remains available. Closing the modal unmounts the form before submission completes.

**Preconditions**: The booking dashboard has loaded and the Create booking dialog is open.

**Steps to Reproduce**:
1. Enter a valid Desk, Floor, and future Date.
2. Select “Add booking”.
3. While “Saving booking…” is visible, immediately select “Close modal”.
4. Reopen the dialog and check whether the booking appears in the list and whether the form values remain.

**Expected Result**: The save completes, or the user is warned before the in-progress booking is discarded.

**Actual Result**: Booking is saved, And comes back when reopening localhost port

**Suggested Fix**: Prevent dismissal while saving, or ask for confirmation before discarding the in-progress booking.

No other observed behavior was filed as a bug: persistence, email/long-text fields, whitespace policy, and the exact search-prefix convention need product decisions before expected results can be asserted.
