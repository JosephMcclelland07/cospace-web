import Link from "next/link";
import BookingList from "@/components/BookingList";
import Game from "@/components/Game";
import styles from "./dashboard.module.css";

export default function Home() {
  return (
    <div className={styles.dashboard}>
      <aside className={styles.sidebar} aria-label="Dashboard sidebar">
        <h2 className={styles.sidebarTitle}>Workspace</h2>
        <nav aria-label="Dashboard navigation">
          <Link href="/" aria-current="page">Dashboard</Link>
          <Link href="/#bookings-heading">Bookings</Link>
          <Link href="/#dashboard-activity">Activity</Link>
        </nav>
      </aside>
      <main className={styles.main} id="dashboard-main" tabIndex={-1}>
        <BookingList />
        <div id="dashboard-activity" className={styles.activity}>
          <Game />
        </div>
      </main>
    </div>
  );
}
