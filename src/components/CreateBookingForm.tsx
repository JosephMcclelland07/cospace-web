"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import type { DeskOption } from "./BookingCard";
import { validateBookingForm, type BookingFormErrors } from "@/utils/validation";
import styles from "./RegistrationForm.module.css";

interface CreateBookingFormProps {
	desks: DeskOption[];
	onAddBooking: (booking: { deskId: number; date: string }) => Promise<void>;
}

export default function CreateBookingForm({ desks, onAddBooking }: CreateBookingFormProps) {
	const [deskId, setDeskId] = useState("");
	const [date, setDate] = useState("");
	const [errors, setErrors] = useState<BookingFormErrors>({});
	const [isLoading, setIsLoading] = useState(false);
	const [submissionError, setSubmissionError] = useState("");
	const submissionPending = useRef(false);
	const formRef = useRef<HTMLFormElement>(null);

	useEffect(() => {
		formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
	}, [errors]);

	async function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();

		if (isLoading || submissionPending.current) {
			return;
		}

		const form = event.currentTarget;
		setSubmissionError("");
		const nextErrors = validateBookingForm(deskId, date);
		setErrors(nextErrors);

		if (Object.keys(nextErrors).length > 0) {
			return;
		}

		submissionPending.current = true;
		setIsLoading(true);

		try {
			await onAddBooking({ deskId: Number(deskId), date });
			if (form.isConnected) {
				setDeskId("");
				setDate("");
				setErrors({});
			}
		} catch (error) {
			if (form.isConnected) {
				setSubmissionError(error instanceof Error ? error.message : "Booking could not be saved. Please try again.");
			}
		} finally {
			submissionPending.current = false;
			if (form.isConnected) setIsLoading(false);
		}
	}

	return (
		<form ref={formRef} className={styles.form} onSubmit={handleSubmit} noValidate aria-labelledby="registration-heading" aria-busy={isLoading}>
			<h2 id="registration-heading">New desk booking</h2>
			{submissionError && <p role="alert" className={styles.error}>{submissionError}</p>}
			{Object.keys(errors).length > 0 && (
				<p role="alert" className={styles.error}>
					Booking not added. Correct the highlighted fields and submit again.
				</p>
			)}

			<div className={styles.field}>
				<label htmlFor="registration-desk">Desk</label>
				<select
					id="registration-desk" name="desk" required
					value={deskId}
					disabled={isLoading}
					onChange={(event) => {
						setDeskId(event.currentTarget.value);
						setSubmissionError("");
					}}
					aria-invalid={errors.desk ? true : undefined}
					aria-describedby={errors.desk ? "registration-desk-error" : undefined}
				>
					<option value="">Select a desk</option>
					{desks.map((desk) => (
						<option key={desk.id} value={desk.id}>
							{desk.name} - Floor {desk.floor}
						</option>
					))}
				</select>
				{errors.desk && <p id="registration-desk-error" role="alert" className={styles.error}>{errors.desk}</p>}
			</div>

			<div className={styles.field}>
				<label htmlFor="registration-floor">Floor</label>
				<output id="registration-floor" htmlFor="registration-desk">
					{desks.find((desk) => String(desk.id) === deskId)?.floor ?? "Select a desk"}
				</output>
			</div>

			<div className={styles.field}>
				<label htmlFor="registration-date">Date</label>
				<input
					id="registration-date" name="date" type="date" required
					value={date}
					disabled={isLoading}
					onChange={(event) => {
						setDate(event.currentTarget.value);
						setSubmissionError("");
					}}
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
