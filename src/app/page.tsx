import BookingList from "@/components/BookingList";
import DashboardSidebar from "@/components/DashboardSidebar";
import Game from "@/components/Game";
import styles from "./dashboard.module.css";

export default function Home() {
  return (
    <div className={styles.dashboard}>
      <DashboardSidebar />
      <main className={styles.main} id="dashboard-main" tabIndex={-1}>
        <BookingList />
        <div id="dashboard-activity" className={styles.activity}>
          <Game />
        </div>
      </main>
    </div>
  );
}
