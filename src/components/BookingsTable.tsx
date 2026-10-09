import Link from "next/link";
import type { BookingCardProps } from "./BookingCard";
import styles from "./BookingsTable.module.css";

export type DeskBooking = BookingCardProps & { id: string };

const mockBookings: DeskBooking[] = [
  { id: "booking-1", desk: "A12", floor: 1, date: "2026-10-02", active: true },
  { id: "booking-2", desk: "B07", floor: 2, date: "2026-10-05", active: false },
  { id: "booking-3", desk: "C03", floor: 3, date: "2026-10-06", active: true },
];

interface BookingsTableProps {
  bookings?: DeskBooking[];
}

export default function BookingsTable({
  bookings = mockBookings,
}: BookingsTableProps) {
  return (
    <div className={styles.container}>
      <table className={styles.table}>
        <caption>Desk booking overview</caption>
        <thead>
          <tr>
            <th scope="col">Desk</th>
            <th scope="col">Floor</th>
            <th scope="col">Date</th>
            <th scope="col">Status</th>
          </tr>
        </thead>
        <tbody>
          {bookings.length === 0 ? (
            <tr>
              <td colSpan={4}>No bookings to display.</td>
            </tr>
          ) : (
            bookings.map((booking) => (
              <tr key={booking.id}>
                <td>
                  <Link href={`/bookings/${booking.id}`}>{booking.desk}</Link>
                </td>
                <td>{booking.floor ?? "Not provided"}</td>
                <td>
                  <time dateTime={booking.date}>{booking.date}</time>
                </td>
                <td className={booking.active ? styles.active : styles.inactive}>
                  {booking.active ? "Active" : "Inactive"}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}