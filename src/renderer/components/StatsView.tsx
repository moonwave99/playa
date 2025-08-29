import useStats from "../query/useStats";
import Loading from "./Loading";
import ErrorView from "./ErrorView";
import LatestAdditionsView from "./LatestAdditionsView";
import styles from "./StatsView.module.css";
import formStyles from "../forms.module.css";
import type { Stats } from "@/types/types";

type StatsViewProps = {
  onClose: () => void;
};

const sortedStatKeys = [
  "release",
  "artist",
  "track",
  "collection",
  "group",
] as (keyof Stats)[];

export default function StatsView({ onClose }: StatsViewProps) {
  const { isPending, error, stats } = useStats();

  if (isPending) {
    return <Loading />;
  }

  if (error) {
    return <ErrorView error={error} />;
  }

  return (
    <div className={styles.view}>
      <section>
        <h2 className={styles.title}>Stats</h2>
        <ul className={styles.stats}>
          {sortedStatKeys.map((key) => (
            <li key={key}>
              <span>{`${key}s`}</span>
              <span>{stats[key].toLocaleString()}</span>
            </li>
          ))}
        </ul>
      </section>
      <LatestAdditionsView />
      <div className={formStyles.actions}>
        <button type="button" className={formStyles.button} onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}
