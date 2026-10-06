"use client";

import { useState } from "react";
import BookingCard, { type BookingCardProps } from "./BookingCard";
import RegistrationForm from "./RegistrationForm";
import styles from "./BookingList.module.css";

type DeskBooking = BookingCardProps & { id: string };

export default function BookingList() {
  const [bookings, setBookings] = useState<DeskBooking[]>([
    { id: "booking-1", desk: "A12", floor: 1, date: "2026-10-02", active: true },
    { id: "booking-2", desk: "B07", floor: 2, date: "2026-10-05", active: false },
    { id: "booking-3", desk: "C03", floor: 3, date: "2026-10-06", active: true },
  ]);
  const [search, setSearch] = useState("");

  function addBooking(booking: BookingCardProps) {
    const newBooking = { ...booking, id: crypto.randomUUID() };
    setBookings((currentBookings) => [...currentBookings, newBooking]);
    setSearch("");
  }

  const query = search.trim().toLowerCase();
  const visibleBookings = bookings.filter((booking) =>
    [booking.desk, `Floor ${booking.floor}`, booking.date].some((value) =>
      value.toLowerCase().includes(query),
    ),
  );

  return (
    <section className={styles.list} aria-labelledby="bookings-heading">
     
      <h1 id="bookings-heading">Desk bookings</h1>
      <RegistrationForm onAddBooking={addBooking} />
      
      <div className={styles.search}>
        <label htmlFor="booking-search">Search bookings</label>
        <input
          id="booking-search"
          type="search"
          placeholder="Desk, floor, or date"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>

      <p role="status">
        {visibleBookings.length} {visibleBookings.length === 1 ? "booking" : "bookings"}
      </p>
      
      {visibleBookings.length > 0 ? (
        visibleBookings.map(({ id, ...booking }) => (
          <BookingCard key={id} href={`/bookings/${id}`} {...booking} />
        ))
      ) : (
        <p>No bookings match your search.</p>
      )}
    </section>
  );
}