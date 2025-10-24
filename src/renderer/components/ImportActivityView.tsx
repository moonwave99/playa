import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import useLatesAdditions from "../query/useLatestAdditions";
import ErrorView from "./ErrorView";
import * as Plot from "@observablehq/plot";
import styles from "./ImportActivityView.module.css";
import type { Release } from "@/types/types";

const defaultFrom = `${new Date().getFullYear()}-01-01`;

function getPlotConfig(
  latestAdditions: Record<string, Pick<Release, "id" | "createdAt">[]>,
  plotAxisLabel: string
) {
  const data = Object.entries(latestAdditions).map(([createdAt, value]) => ({
    createdAt: new Date(createdAt),
    count: value.length,
  }));

  return {
    width: window.innerWidth - 64,
    x: {
      interval: "day" as const,
      label: "",
    },
    y: {
      type: "sqrt" as const,
      label: plotAxisLabel,
      grid: true,
    },
    marks: [
      Plot.barY(data, { x: "createdAt", y: "count", fill: "#4361ee" }),
      Plot.ruleY([0]),
    ],
  };
}

export default function ImportActivityView() {
  const { t } = useTranslation();
  const [from, setFrom] = useState(defaultFrom);
  const ref = useRef(null);
  const { error, latestAdditions } = useLatesAdditions(from);

  useEffect(() => {
    if (!latestAdditions) {
      return;
    }
    const plotAxisLabel = t("pages.HomePage.importActivity.plotAxisLabel");
    const barChart = Plot.plot(getPlotConfig(latestAdditions, plotAxisLabel));
    ref.current.append(barChart);
    return () => barChart.remove();
  }, [latestAdditions]);

  if (error) {
    return <ErrorView error={error} />;
  }

  const total = Object.values(latestAdditions || []).reduce(
    (memo, item) => memo + item.length,
    0
  );

  return (
    <section className={styles.view}>
      <header className={styles.header}>
        <h2 className={styles.title}>
          {t("pages.HomePage.importActivity.title")}
        </h2>
        <label>
          {t("pages.HomePage.importActivity.dateInputLabel")}
          <input
            type="date"
            value={from}
            onChange={(event) =>
              setFrom((event.target as HTMLInputElement).value)
            }
          />
          :<strong>{total}</strong>
        </label>
      </header>
      <figure ref={ref} className={styles.plot}></figure>
    </section>
  );
}
