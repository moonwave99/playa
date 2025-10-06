import { useTranslation } from "react-i18next";
import useStats from "../query/useStats";
import Loading from "./Loading";
import ErrorView from "./ErrorView";
import ImportActivityView from "./ImportActivityView";
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
  const { t } = useTranslation();
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
        <h2 className={styles.title}>{t("pages.HomePage.stats.title")}</h2>
        <ul className={styles.stats}>
          {sortedStatKeys.map(({ key }) => (
            <li key={key}>
              <span className={styles.entry}>
                <span>{`${key}s`}</span>
                <span>{stats[key].toLocaleString()}</span>
              </span>
            </li>
          ))}
        </ul>
      </section>
      <ImportActivityView />
    </div>
  );
}
