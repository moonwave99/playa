import type { MouseEvent } from "react";
import cx from "clsx";
import Cover from "./Cover";
import Link from "./Link";
import type { ReleaseWithArtist } from "@/types/types";
import styles from "./ReleaseGroup.module.css";

type ReleaseGroupProps = {
    title: string;
    link: string;
    releases: ReleaseWithArtist[];
    onClick: (event: MouseEvent) => void;
    onDoubleClick?: () => void;
    onContextMenu?: () => void;
    selected?: boolean;
    hasFocus?: boolean;
};

const releaseCount = 4;

export default function ReleaseGroup({
    title,
    link,
    releases,
    onClick,
    selected,
    hasFocus,
    onContextMenu,
}: ReleaseGroupProps) {
    const releasesToDisplay = releases.slice(0, releaseCount);
    return (
        <article
            className={cx(styles.view, {
                selected,
                hasFocus: selected && hasFocus,
            })}
            onClick={onClick}
            onContextMenu={onContextMenu}
        >
            <ul className={styles.releases}>
                {releasesToDisplay.map(({ title, artist, ...rest }) => (
                    <li key={rest.id}>
                        <Cover {...rest} title={`${artist.name} - ${title}`} />
                    </li>
                ))}
                {Array(releaseCount - releasesToDisplay.length)
                    .fill(true)
                    .map((_, index) => (
                        <li key={index} className={styles.ghost}></li>
                    ))}
            </ul>
            <footer className={styles.title}>
                <Link to={link}>{title}</Link>
                <span className={styles.count}>{releases.length} entries</span>
            </footer>
        </article>
    );
}
