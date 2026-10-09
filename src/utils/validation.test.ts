import { validateBookingForm } from "./validation";

const today = new Date(2026, 9, 9);

describe("validateBookingForm characterization", () => {
	it("accepts a selected desk and today's date", () => {
		// Arrange
		const deskId = "1";
		const date = "2026-10-09";

		// Act
		const errors = validateBookingForm(deskId, date, today);

		// Assert
		expect(errors).toEqual({});
	});

	it("requires a desk and date", () => {
		// Arrange
		const deskId = "";
		const date = "";

		// Act
		const errors = validateBookingForm(deskId, date, today);

		// Assert
		expect(errors).toEqual({
			desk: "Select a desk.",
			date: "Enter a valid booking date.",
		});
	});

	it.each(["0", "1.5", "9007199254740992"])("rejects desk ID %s", (deskId) => {
		// Arrange
		const date = "2026-10-09";

		// Act
		const errors = validateBookingForm(deskId, date, today);

		// Assert
		expect(errors).toEqual({ desk: "Select a desk." });
	});

	it.each(["2026-2-09", "2026-02-30"])("rejects invalid date %s", (date) => {
		// Arrange
		const deskId = "1";

		// Act
		const errors = validateBookingForm(deskId, date, today);

		// Assert
		expect(errors).toEqual({ date: "Enter a valid booking date." });
	});

	it("rejects a date before today", () => {
		// Arrange
		const deskId = "1";
		const date = "2026-10-08";

		// Act
		const errors = validateBookingForm(deskId, date, today);

		// Assert
		expect(errors).toEqual({ date: "Booking date cannot be in the past." });
	});
});