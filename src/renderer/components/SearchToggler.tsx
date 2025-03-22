import type { Sidebars } from "@/types/types";
import cx from "clsx";
import styles from "./SearchToggler.module.css";

type SearchTogglerProps = {
    currentSidebar: Sidebars;
    selectSidebar: (sidebar: Sidebars) => void;
    sidebarsMap: { sidebar: Sidebars; label: string }[];
};

export default function SearchToggler({
    currentSidebar,
    selectSidebar,
    sidebarsMap,
}: SearchTogglerProps) {
    return (
        <div className={styles.searchToggler}>
            {sidebarsMap.map(({ sidebar, label }) => (
                <button
                    key={sidebar}
                    className={cx(styles.button, {
                        [styles.isCurrent]: sidebar === currentSidebar,
                    })}
                    onClick={() => selectSidebar(sidebar)}
                >
                    {label}
                </button>
            ))}
        </div>
    );
}
