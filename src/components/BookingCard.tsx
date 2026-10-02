import styles from "./BookingCard.module.css";

export interface BookingCardProps {
  desk: string;
  floor: number;
  date: string;
  active: boolean;
}

export default function BookingCard({
  desk,
  floor,
  date,
  active,
}: BookingCardProps) {
  return (
    <article className={styles.card}>
      <h2>Desk {desk}</h2>
      <p>Floor: {floor}</p>
      <p>
        Date: <time dateTime={date}>{date}</time>
      </p>
      <p className={active ? styles.active : styles.inactive}>
        Status: {active ? "Active" : "Inactive"}
      </p>
    </article>
  );
}