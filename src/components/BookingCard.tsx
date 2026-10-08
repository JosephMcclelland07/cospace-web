import Link from "next/link";
import styles from "./BookingCard.module.css";

export interface BookingCardProps {
  desk: string;
  floor: number | null;
  date: string;
  active: boolean;
}

export default function BookingCard({
  desk,
  floor,
  date,
  active,
  href,
}: BookingCardProps & { href?: string }) {
  const card = (
    <article className={styles.card}>
      <h2>Desk {desk}</h2>
      <p>Floor: {floor ?? "Not provided"}</p>
      <p>
        Date: <time dateTime={date}>{date}</time>
      </p>
      <p className={active ? styles.active : styles.inactive}>
        Status: {active ? "Active" : "Inactive"}
      </p>
    </article>
  );

  return href ? (
    <Link href={href} className={styles.link}>
      {card}
    </Link>
  ) : (
    card
  );
}