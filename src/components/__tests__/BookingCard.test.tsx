import { render, screen, within } from "@testing-library/react";
import BookingCard from "../BookingCard";

describe("BookingCard", () => {
	it("exposes the booking details as a link to that booking", () => {
		// Arrange
		render(
			<BookingCard
				desk="Desk-01"
				floor={1}
				date="2026-10-10"
				active
				href="/bookings/42"
			/>,
		);

		// Act
		const link = screen.getByRole("link", {
			name: /Desk-01.*Floor: 1.*Date: 2026-10-10.*Status: Active/,
		});
		const booking = within(link);

		// Assert
		expect(link).toHaveAttribute("href", "/bookings/42");
		expect(booking.getByRole("heading", { name: "Desk-01" })).toBeVisible();
		expect(booking.getByText("Floor: 1")).toBeVisible();
		expect(booking.getByText("2026-10-10")).toBeVisible();
		expect(booking.getByText("Status: Active")).toBeVisible();
	});
});