import { useTranslation } from "react-i18next";
import useStats from "../query/useStats";
import Loading from "./Loading";
import ErrorView from "./ErrorView";
import ImportActivityView from "./ImportActivityView";
import type { Stats } from "@/types/types";

import cx from "clsx";
import styles from "./StatsView.module.css";
import formStyles from "../forms.module.css";

const sortedStats: (keyof Stats)[] = [
  "release",
  "artist",
  "track",
  "collection",
  "group",
];

type StatsViewProps = {
  closeModal: () => void;
};

export default function StatsView({ closeModal }: StatsViewProps) {
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
        <h2 className={styles.title}>{t("modals.StatsView.title")}</h2>
        <ul className={styles.stats}>
          {sortedStats.map((key) => (
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
      <div className={formStyles.actions}>
        <button
          type="button"
          className={cx(formStyles.button, formStyles.primary)}
          onClick={closeModal}
        >
          {t("modals.StatsView.actions.close")}
        </button>
      </div>
    </div>
  );
}
