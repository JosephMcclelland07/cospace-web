import Link from "next/link";
import styles from "../app/dashboard.module.css";

export default function DashboardSidebar() {
  return (
    <aside className={styles.sidebar} aria-label="Dashboard sidebar">
      <h2 className={styles.sidebarTitle}>Workspace</h2>
      <nav aria-label="Dashboard navigation">
        <Link href="/" aria-current="page">Dashboard</Link>
        <Link href="/#bookings-heading">Bookings</Link>
        <Link href="/#dashboard-activity">Activity</Link>
      </nav>
    </aside>
  );
}