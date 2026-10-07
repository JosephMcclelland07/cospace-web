"use client";

import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import type { BookingCardProps } from "./BookingCard";
import styles from "./RegistrationForm.module.css";

interface CreateBookingFormProps {
	onAddBooking: (booking: BookingCardProps) => void;
}

type FormErrors = Partial<Record<"desk" | "floor" | "date", string>>;

interface BookingFormValues {
	desk: string;
	floor: string;
	date: string;
}

export function validateBookingForm(
	{ desk, floor, date }: BookingFormValues,
	today = new Date(),
): FormErrors {
	const nextErrors: FormErrors = {};

	if (desk.trim().length < 3) {
		nextErrors.desk = "Desk name must be at least 3 characters long.";
	}
	if (floor.trim().length < 5) {
		nextErrors.floor = "Floor must be at least 5 characters long.";
	} else if (!Number.isSafeInteger(Number(floor)) || Number(floor) < 0) {
		nextErrors.floor = "Enter a whole floor number of 0 or higher.";
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

export default function CreateBookingForm({ onAddBooking }: CreateBookingFormProps) {
	const [desk, setDesk] = useState("");
	const [floor, setFloor] = useState("");
	const [date, setDate] = useState("");
	const [errors, setErrors] = useState<FormErrors>({});
	const [isLoading, setIsLoading] = useState(false);
	const [successMessage, setSuccessMessage] = useState("");
	const [submissionError, setSubmissionError] = useState("");
	const submissionPending = useRef(false);
	const formRef = useRef<HTMLFormElement>(null);

	useEffect(() => {
		formRef.current?.querySelector<HTMLInputElement>('[aria-invalid="true"]')?.focus();
	}, [errors]);

	function handleChange(event: ChangeEvent<HTMLInputElement>) {
		const { name, value } = event.currentTarget;
		setSuccessMessage("");
		setSubmissionError("");

		switch (name) {
			case "desk":
				setDesk(value);
				break;
			case "floor":
				setFloor(value);
				break;
			case "date":
				setDate(value);
				break;
		}
	}

	async function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();

		if (isLoading || submissionPending.current) {
			return;
		}

		const form = event.currentTarget;
		setSuccessMessage("");
		setSubmissionError("");
		const nextErrors = validateBookingForm({ desk, floor, date });
		setErrors(nextErrors);

		if (Object.keys(nextErrors).length > 0) {
			return;
		}

		submissionPending.current = true;
		setIsLoading(true);

		try {
			await new Promise<void>((resolve) => setTimeout(resolve, 2000));
			if (!form.isConnected) {
				return;
			}

			onAddBooking({
				desk: desk.trim(),
				floor: Number(floor),
				date,
				active: true,
			});
			setDesk("");
			setFloor("");
			setDate("");
			setSuccessMessage("Booking created successfully.");
		} catch {
			setSubmissionError("Booking could not be created. Please try again.");
		} finally {
			submissionPending.current = false;
			if (form.isConnected) {
				setIsLoading(false);
			}
		}
	}

	return (
		<form ref={formRef} className={styles.form} onSubmit={handleSubmit} noValidate aria-labelledby="registration-heading" aria-busy={isLoading}>
			<h2 id="registration-heading">New desk booking</h2>
			{successMessage && <p role="status">{successMessage}</p>}
			{submissionError && <p role="alert" className={styles.error}>{submissionError}</p>}
			{Object.keys(errors).length > 0 && (
				<p role="alert" className={styles.error}>
					Booking not added. Correct the highlighted fields and submit again.
				</p>
			)}

			<div className={styles.field}>
				<label htmlFor="registration-desk">Desk</label>
				<input
					id="registration-desk" name="desk" type="text" minLength={3} required pattern={".*\\S.*"}
					value={desk}
					disabled={isLoading}
					onChange={handleChange}
					aria-invalid={errors.desk ? true : undefined}
					aria-describedby={errors.desk ? "registration-desk-error" : undefined}
				/>
				{errors.desk && <p id="registration-desk-error" role="alert" className={styles.error}>{errors.desk}</p>}
			</div>

			<div className={styles.field}>
				<label htmlFor="registration-floor">Floor</label>
				<input
					id="registration-floor" name="floor" type="number" min={0} step={1} required
					value={floor}
					disabled={isLoading}
					onChange={handleChange}
					aria-invalid={errors.floor ? true : undefined}
					aria-describedby={errors.floor ? "registration-floor-error" : undefined}
				/>
				{errors.floor && <p id="registration-floor-error" role="alert" className={styles.error}>{errors.floor}</p>}
			</div>

			<div className={styles.field}>
				<label htmlFor="registration-date">Date</label>
				<input
					id="registration-date" name="date" type="date" required
					value={date}
					disabled={isLoading}
					onChange={handleChange}
					aria-invalid={errors.date ? true : undefined}
					aria-describedby={errors.date ? "registration-date-error" : undefined}
				/>
				{errors.date && <p id="registration-date-error" role="alert" className={styles.error}>{errors.date}</p>}
			</div>

			<button type="submit" disabled={isLoading}>
				{isLoading ? "Saving booking..." : "Add booking"}
			</button>
		</form>
	);
}
