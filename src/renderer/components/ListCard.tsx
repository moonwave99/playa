import { useEffect } from "react";
import type { MouseEvent } from "react";
import cx from "clsx";
import Cover from "./Cover";
import Link from "./Link";
import useDominantColor from "../hooks/useDominantColor";
import { getDiscInfo, getReleaseTitle } from "@/lib/utils";
import {
    getCover,
    getArtistLink,
    getReleaseLink,
    getCollectionLink,
} from "@/lib/links";
import type {
    ArtistWithReleases,
    ReleaseWithArtistAndSubreleases,
    CollectionWithReleases,
} from "@/types/types";
import styles from "./ListCard.module.css";

type Item =
    | CollectionWithReleases
    | ArtistWithReleases
    | ReleaseWithArtistAndSubreleases;

type ListCardProps = {
    item: Item;
    selected?: boolean;
    hasFocus?: boolean;
    isSingle?: boolean;
    onClick?: (event: MouseEvent) => void;
    onDoubleClick?: () => void;
    onContextMenu?: () => void;
    onColorChange?: (useDarkText: boolean) => void;
};

function getCoverRelease(item: Item) {
    return item._type === "release" ? item : item.releases[0];
}

export default function ListCard({
    item,
    selected,
    hasFocus,
    isSingle,
    onClick,
    onContextMenu,
    onColorChange,
}: ListCardProps) {
    const coverRelease = getCoverRelease(item);
    const { color, useDarkText } = useDominantColor(
        getCover(coverRelease.hash)
    );

    useEffect(() => {
        onColorChange && onColorChange(useDarkText);
        return () => {
            onColorChange && onColorChange(false);
        };
    }, [useDarkText]);

    function getContent() {
        if (item._type === "release") {
            return (
                <>
                    <Link
                        className={styles.artist}
                        to={getArtistLink(item.artist)}
                    >
                        {item.artist.name}
                    </Link>
                    <Link className={styles.title} to={getReleaseLink(item)}>
                        {getReleaseTitle(item)}
                    </Link>
                    <div className={styles.info}>
                        {item.type}, {item.year} {getDiscInfo(item)}
                    </div>
                </>
            );
        }

        return (
            <>
                {item._type === "artist" ? (
                    <Link className={styles.title} to={getArtistLink(item)}>
                        {item.name}
                    </Link>
                ) : (
                    <Link className={styles.title} to={getCollectionLink(item)}>
                        {item.title}
                    </Link>
                )}
                <div className={styles.info}>
                    {item.releases.length} releases
                </div>
            </>
        );
    }

    return (
        <div
            className={cx(styles.listCard, {
                [styles.isSingle]: isSingle,
                [styles.selected]: selected,
                [styles.hasFocus]: selected && hasFocus,
                [styles.useDarkText]: useDarkText,
            })}
            onClick={onClick}
            onContextMenu={onContextMenu}
            style={{ background: color }}
        >
            <Cover
                {...coverRelease}
                className={styles.cover}
                title={`${coverRelease.artist.name} - ${getReleaseTitle(
                    coverRelease
                )}`}
            />
            <div className={styles.content}>{getContent()}</div>
        </div>
    );
}
