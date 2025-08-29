import { useState, useEffect, useRef } from "react";
import useLatesAdditions from "../query/useLatestAdditions";
import ErrorView from "./ErrorView";
import * as Plot from "@observablehq/plot";
import styles from "./LatestAdditionsView.module.css";
import type { Release } from "@/types/types";

const defaultFrom = "2025-01-01";

function getPlotConfig(
  latestAdditions: Record<string, Pick<Release, "id" | "createdAt">[]>
) {
  const data = Object.entries(latestAdditions).map(([createdAt, value]) => ({
    createdAt: new Date(createdAt),
    count: value.length,
  }));

  return {
    width: 1000,
    x: {
      interval: "day" as const,
      label: "",
    },
    y: {
      type: "sqrt" as const,
      label: "Daily added releases",
      grid: true,
    },
    marks: [
      Plot.barY(data, { x: "createdAt", y: "count", fill: "#4361ee" }),
      Plot.ruleY([0]),
    ],
  };
}

export default function LatestAdditionsView() {
  const [from, setFrom] = useState(defaultFrom);
  const ref = useRef(null);
  const { error, latestAdditions } = useLatesAdditions(from);

  useEffect(() => {
    if (!latestAdditions) {
      return;
    }
    const barChart = Plot.plot(getPlotConfig(latestAdditions));
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
        <h2 className={styles.title}>Latest Additions</h2>
        <label>
          From
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
