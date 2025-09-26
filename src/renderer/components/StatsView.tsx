import useStats from "../query/useStats";
import Loading from "./Loading";
import ErrorView from "./ErrorView";
import LatestAdditionsView from "./LatestActivityView";
import Link from "./Link";
import styles from "./StatsView.module.css";
import type { Stats } from "@/types/types";

const sortedStatKeys: {
  key: keyof Stats;
  link: string;
}[] = [
  {
    key: "release",
    link: "/releases",
  },
  {
    key: "artist",
    link: "/artists",
  },
  {
    key: "track",
    link: null,
  },
  {
    key: "collection",
    link: "/collections",
  },
  {
    key: "group",
    link: "/groups",
  },
];

export default function StatsView() {
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
        <h2 className={styles.title}>Your Library</h2>
        <ul className={styles.stats}>
          {sortedStatKeys.map(({ key, link }) => (
            <li key={key}>
              {link ? (
                <Link to={link} className={styles.entry}>
                  <span>{`${key}s`}</span>
                  <span>{stats[key].toLocaleString()}</span>
                </Link>
              ) : (
                <span className={styles.entry}>
                  <span>{`${key}s`}</span>
                  <span>{stats[key].toLocaleString()}</span>
                </span>
              )}
            </li>
          ))}
        </ul>
      </section>
      <LatestAdditionsView />
    </div>
  );
}
