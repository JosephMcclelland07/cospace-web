import Link from "next/link";
import BookingCard, { type BookingCardProps } from "@/components/BookingCard";
import styles from "../../page.module.css";

type DeskBooking = BookingCardProps & { id: string };

const bookings: DeskBooking[] = [
	{ id: "booking-1", desk: "A12", floor: 1, date: "2026-10-02", active: true },
	{ id: "booking-2", desk: "B07", floor: 2, date: "2026-10-05", active: false },
	{ id: "booking-3", desk: "C03", floor: 3, date: "2026-10-06", active: true },
];

interface BookingPageProps {
	params: Promise<{ id: string }>;
}

export default async function BookingPage({ params }: BookingPageProps) {
	const { id } = await params;
	const booking = bookings.find((booking) => booking.id === id);

	if (!booking) {
		return (
			<div className={styles.page}>
				<main className={styles.main}>
					<section aria-labelledby="missing-booking-heading">
						<h1 id="missing-booking-heading">Booking not found</h1>
						<p>This desk booking does not exist or has been removed.</p>
						<Link href="/">Back to home</Link>
					</section>
				</main>
			</div>
		);
	}

	return (
		<div className={styles.page}>
			<main className={styles.main}>
				<section aria-labelledby="booking-heading">
					<h1 id="booking-heading">Booking details</h1>
					<p>Booking ID: {booking.id}</p>
					<BookingCard {...booking} />
					<Link href="/">Back to bookings</Link>
				</section>
			</main>
		</div>
	);
}
