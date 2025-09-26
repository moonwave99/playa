import StatsView from "../components/StatsView";
import styles from "./Page.module.css";

export default function HomePage() {
  return (
    <div className={styles.page}>
      <StatsView />
    </div>
  );
}
