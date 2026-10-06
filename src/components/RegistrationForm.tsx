"use client";

import type { FormEvent } from "react";
import type { BookingCardProps } from "./BookingCard";
import styles from "./RegistrationForm.module.css";

interface RegistrationFormProps {
  onAddBooking: (booking: BookingCardProps) => void;
}

export default function RegistrationForm({ onAddBooking }: RegistrationFormProps) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);
    const desk = formData.get("desk");
    const floor = formData.get("floor");
    const date = formData.get("date");

    if (typeof desk !== "string" || typeof floor !== "string" || typeof date !== "string") {
      return;
    }

    onAddBooking({ desk: desk.trim(), floor: Number(floor), date, active: true });
    form.reset();
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} aria-labelledby="registration-heading">
      <h2 id="registration-heading">New desk booking</h2>
      
      <div className={styles.field}>
        <label htmlFor="registration-desk">Desk</label>
        <input id="registration-desk" name="desk" type="text" required pattern={".*\\S.*"} />
      </div>

      <div className={styles.field}>
        <label htmlFor="registration-floor">Floor</label>
        <input id="registration-floor" name="floor" type="number" min={0} step={1} required />
      </div>

      <div className={styles.field}>
        <label htmlFor="registration-date">Date</label>
        <input id="registration-date" name="date" type="date" required />
      </div>

      <button type="submit">Add booking</button>
    </form>
  );
}