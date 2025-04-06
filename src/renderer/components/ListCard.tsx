import { useState, useEffect } from "react";
import type { MouseEvent } from "react";
import cx from "clsx";
import Cover from "./Cover";
import Link from "./Link";
import useDominantColor from "../hooks/useDominantColor";
import { getDiscInfo, getReleaseTitle, getCoverRelease } from "@/lib/utils";
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
    className?: string;
    selected?: boolean;
    hasFocus?: boolean;
    isSingle?: boolean;
    onClick?: (event: MouseEvent) => void;
    onDoubleClick?: () => void;
    onContextMenu?: () => void;
    onColorChange?: (useDarkText: boolean) => void;
    showMultipleCovers?: boolean;
    onCoverDoubleClick?: (release_id: number) => void;
};

export default function ListCard({
    item,
    className,
    selected,
    hasFocus,
    isSingle,
    onClick,
    onContextMenu,
    onColorChange,
    showMultipleCovers,
    onCoverDoubleClick,
}: ListCardProps) {
    const [loadCount, setLoadCount] = useState(0);
    const coverRelease = getCoverRelease(item);
    const { color, useDarkText, loaded } = useDominantColor(
        getCover(coverRelease.hash),
        loadCount
    );

    useEffect(() => {
        if (onColorChange) {
            onColorChange(useDarkText);
        }
        return () => {
            if (onColorChange) {
                onColorChange(false);
            }
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
                    <Link
                        className={styles.title}
                        to={getArtistLink(item)}
                        title={`${item.name} [${item.id}]`}
                    >
                        {item.name}
                    </Link>
                ) : (
                    <Link
                        className={styles.title}
                        to={getCollectionLink(item)}
                        title={`${item.title} [${item.id}]`}
                    >
                        {item.title}
                    </Link>
                )}
                <div className={styles.info}>
                    {item.releases.length} releases
                </div>
            </>
        );
    }

    function onLoad() {
        setLoadCount((prev) => prev + 1);
    }

    function onError() {
        setLoadCount((prev) => prev + 1);
    }

    return (
        <div
            className={cx(styles.listCard, {
                [styles.loaded]: loaded,
                [styles.isSingle]: isSingle,
                [styles.selected]: selected,
                [styles.hasFocus]: selected && hasFocus,
                [styles.useDarkText]: useDarkText,
                className,
            })}
            onClick={onClick}
            onContextMenu={onContextMenu}
            style={{ background: color }}
        >
            {showMultipleCovers &&
            (item as CollectionWithReleases | ArtistWithReleases).releases
                .length > 1 ? (
                <MultipleCovers
                    item={item as CollectionWithReleases | ArtistWithReleases}
                    onLoad={onLoad}
                    onError={onError}
                    onCoverDoubleClick={onCoverDoubleClick}
                />
            ) : (
                <Cover
                    {...coverRelease}
                    className={styles.cover}
                    title={`${coverRelease.artist.name} - ${getReleaseTitle(
                        coverRelease
                    )}`}
                    onLoad={onLoad}
                    onError={onError}
                />
            )}
            <div className={styles.content}>{getContent()}</div>
        </div>
    );
}

type MultipleCoversProps = {
    item: CollectionWithReleases | ArtistWithReleases;
    count?: number;
    onLoad: () => void;
    onError: () => void;
    onCoverDoubleClick?: (release_id: number) => void;
};

function MultipleCovers({
    item,
    count = 5,
    onLoad,
    onError,
    onCoverDoubleClick,
}: MultipleCoversProps) {
    const coverRelease = getCoverRelease(item);
    const otherReleases = item.releases
        .filter((x) => x.id !== coverRelease.id)
        .slice(0, count - 1);

    return (
        <div className={styles.multipleCovers}>
            <>
                {otherReleases.map((release) => (
                    <Cover
                        key={release.id}
                        {...release}
                        className={styles.cover}
                        title={`${release.artist.name} - ${getReleaseTitle(
                            release
                        )}`}
                        onDoubleClick={() => onCoverDoubleClick(release.id)}
                    />
                ))}
                <Cover
                    {...coverRelease}
                    className={styles.cover}
                    title={`${coverRelease.artist.name} - ${getReleaseTitle(
                        coverRelease
                    )}`}
                    onLoad={onLoad}
                    onError={onError}
                    onDoubleClick={() => onCoverDoubleClick(coverRelease.id)}
                />
            </>
        </div>
    );
}
