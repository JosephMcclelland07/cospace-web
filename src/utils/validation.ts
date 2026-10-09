export type BookingFormErrors = Partial<Record<"desk" | "date", string>>;

export function validateBookingForm(
	deskId: string,
	date: string,
	today = new Date(),
): BookingFormErrors {
	const nextErrors: BookingFormErrors = {};
	const parsedDeskId = Number(deskId);

	if (!Number.isSafeInteger(parsedDeskId) || parsedDeskId < 1) {
		nextErrors.desk = "Select a desk.";
	}

	const bookingDate = new Date(`${date}T00:00:00`);
	const [year, month, day] = date.split("-").map(Number);
	const todayStart = new Date(today);
	todayStart.setHours(0, 0, 0, 0);

	if (!/^\d{4}-\d{2}-\d{2}$/.test(date) ||
			Number.isNaN(bookingDate.getTime()) ||
			bookingDate.getFullYear() !== year ||
			bookingDate.getMonth() + 1 !== month ||
			bookingDate.getDate() !== day) {
		nextErrors.date = "Enter a valid booking date.";
	} else if (bookingDate < todayStart) {
		nextErrors.date = "Booking date cannot be in the past.";
	}

	return nextErrors;
}