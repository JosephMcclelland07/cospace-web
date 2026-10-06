"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import type { BookingCardProps } from "./BookingCard";
import styles from "./RegistrationForm.module.css";

interface RegistrationFormProps {
  onAddBooking: (booking: BookingCardProps) => void;
}

type FormErrors = Partial<Record<"desk" | "floor" | "date", string>>;

export default function RegistrationForm({ onAddBooking }: RegistrationFormProps) {
  const [errors, setErrors] = useState<FormErrors>({});
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    formRef.current?.querySelector<HTMLInputElement>('[aria-invalid="true"]')?.focus();
  }, [errors]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = event.currentTarget;
    const deskInput = form.elements.namedItem("desk");
    const floorInput = form.elements.namedItem("floor");
    const dateInput = form.elements.namedItem("date");

    if (!(deskInput instanceof HTMLInputElement) ||
        !(floorInput instanceof HTMLInputElement) ||
        !(dateInput instanceof HTMLInputElement)) {
      return;
    }

    const nextErrors: FormErrors = {};
    if (!deskInput.value.trim()) {
      nextErrors.desk = "Enter a desk name.";
    }
    if (!floorInput.validity.valid) {
      nextErrors.floor = "Enter a whole floor number of 0 or higher.";
    }
    if (!dateInput.validity.valid) {
      nextErrors.date = "Enter a valid booking date.";
    }
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    onAddBooking({
      desk: deskInput.value.trim(),
      floor: floorInput.valueAsNumber,
      date: dateInput.value,
      active: true,
    });
    form.reset();
  }

  return (
    <form ref={formRef} className={styles.form} onSubmit={handleSubmit} noValidate aria-labelledby="registration-heading">
      <h2 id="registration-heading">New desk booking</h2>
      {Object.keys(errors).length > 0 && (
        <p role="alert" className={styles.error}>
          Booking not added. Correct the highlighted fields and submit again.
        </p>
      )}

      <div className={styles.field}>
        <label htmlFor="registration-desk">Desk</label>
        <input
          id="registration-desk" name="desk" type="text" required pattern={".*\\S.*"}
          aria-invalid={errors.desk ? true : undefined}
          aria-describedby={errors.desk ? "registration-desk-error" : undefined}
        />
        {errors.desk && <p id="registration-desk-error" className={styles.error}>{errors.desk}</p>}
      </div>

      <div className={styles.field}>
        <label htmlFor="registration-floor">Floor</label>
        <input
          id="registration-floor" name="floor" type="number" min={0} step={1} required
          aria-invalid={errors.floor ? true : undefined}
          aria-describedby={errors.floor ? "registration-floor-error" : undefined}
        />
        {errors.floor && <p id="registration-floor-error" className={styles.error}>{errors.floor}</p>}
      </div>

      <div className={styles.field}>
        <label htmlFor="registration-date">Date</label>
        <input
          id="registration-date" name="date" type="date" required
          aria-invalid={errors.date ? true : undefined}
          aria-describedby={errors.date ? "registration-date-error" : undefined}
        />
        {errors.date && <p id="registration-date-error" className={styles.error}>{errors.date}</p>}
      </div>

      <button type="submit">Add booking</button>
    </form>
  );
}