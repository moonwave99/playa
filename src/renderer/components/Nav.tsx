import type { Sidebars } from "@/types/types";
import cx from "clsx";
import styles from "./Nav.module.css";

type NavProps = {
    currentSidebar: Sidebars;
    selectSidebar: (sidebar: Sidebars) => void;
    sidebarsMap: { sidebar: Sidebars; label: string }[];
};

export default function Nav({
    currentSidebar,
    selectSidebar,
    sidebarsMap,
}: NavProps) {
    return (
        <nav className={styles.nav}>
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
        </nav>
    );
}
