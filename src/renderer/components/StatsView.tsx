import { Fragment } from "react";
import useStats from "../query/useStats";
import Loading from "./Loading";
import ErrorView from "./ErrorView";
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
            <h2 className={styles.title}>Stats</h2>
            <dl className={styles.stats}>
                {sortedStatKeys.map((key) => (
                    <Fragment key={key}>
                        <dt>{`${key}s`}</dt>
                        <dd>{stats[key].toLocaleString()}</dd>
                    </Fragment>
                ))}
            </dl>
            <div className={formStyles.actions}>
                <button
                    type="button"
                    className={formStyles.button}
                    onClick={onClose}
                >
                    Close
                </button>
            </div>
        </div>
    );
}
