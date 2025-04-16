import { useState, useEffect } from "react";
import type { MouseEvent } from "react";
import useDominantColor from "../hooks/useDominantColor";
import useHover from "../hooks/useHover";
import {
    getDiscInfo,
    getReleaseTitle,
    getCoverRelease,
    withStopPropagation,
} from "@/lib/utils";
import {
    getCover,
    getArtistLink,
    getReleaseLink,
    getCollectionLink,
    getGroupLink,
} from "@/lib/links";
import type {
    ArtistWithReleases,
    ReleaseWithArtistAndSubreleases,
    CollectionWithReleases,
    GroupWithArtists,
} from "@/types/types";

import EntityList from "./EntityList";
import Cover from "./Cover";
import Link from "./Link";
import RelatedArtistsList from "./RelatedArtistsList";
import ContainingCollectionsList from "./ContainingCollectionsList";
import ContainingGroupsList from "./ContainingGroupsList";
import Droppable, { type DroppableRender } from "./Droppable";

import cx from "clsx";
import styles from "./ListCard.module.css";

type Item =
    | CollectionWithReleases
    | ArtistWithReleases
    | ReleaseWithArtistAndSubreleases
    | GroupWithArtists;

type ListCardProps = {
    item: Item;
    className?: string;
    selected?: boolean;
    hasFocus?: boolean;
    isSingle?: boolean;
    hideCover?: boolean;
    onClick?: (event: MouseEvent) => void;
    onCoverClick?: () => void;
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
    hideCover,
    onClick,
    onCoverClick,
    onContextMenu,
    onColorChange,
    showMultipleCovers,
    onCoverDoubleClick,
}: ListCardProps) {
    const [loadCount, setLoadCount] = useState(0);
    const coverRelease = getCoverRelease(item);
    const { color, useDarkText, loaded } = useDominantColor(
        coverRelease ? getCover(coverRelease.hash) : null,
        loadCount
    );

    useEffect(() => {
        if (!onColorChange) {
            return;
        }
        onColorChange(useDarkText);
        return () => onColorChange(false);
    }, [useDarkText]);

    const { onMouseEnter, onMouseLeave, isHover } = useHover();

    function getContent() {
        if (item._type === "release") {
            return (
                <>
                    <EntityList
                        className={styles.artist}
                        useDarkText={useDarkText}
                        canDeleteFirstEntry={false}
                        items={[item.artist, ...item.additionalArtists]}
                        onDelete={(artist_id) =>
                            window.api.release.removeAdditionalArtist({
                                release_id: item.id,
                                artist_id,
                            })
                        }
                    />
                    <Link
                        className={styles.title}
                        to={getReleaseLink(item)}
                        title={`[${item.id}]`}
                    >
                        {getReleaseTitle(item)}
                    </Link>
                    <div className={styles.info}>
                        {item.type}, {item.year} {getDiscInfo(item)}
                        {isSingle && (
                            <>
                                <ContainingCollectionsList
                                    prependSeparator
                                    useDarkText={useDarkText}
                                    id={item.id}
                                />
                            </>
                        )}
                    </div>
                </>
            );
        }

        if (item._type === "artist") {
            return (
                <>
                    <Link
                        className={styles.title}
                        to={getArtistLink(item)}
                        title={`[${item.id}]`}
                    >
                        {item.name}
                    </Link>

                    <div className={styles.info}>
                        {item.releases.length} releases
                    </div>
                    {isSingle && (
                        <>
                            <RelatedArtistsList
                                useDarkText={useDarkText}
                                id={item.id}
                            />
                            <ContainingGroupsList
                                useDarkText={useDarkText}
                                id={item.id}
                            />
                        </>
                    )}
                </>
            );
        }
        if (item._type === "group") {
            return (
                <>
                    <Link
                        className={styles.title}
                        to={getGroupLink(item)}
                        title={`[${item.id}]`}
                    >
                        {item.title}
                    </Link>
                    <div className={styles.info}>
                        {item.artists.length} artists
                    </div>
                </>
            );
        }

        return (
            <>
                <Link
                    className={styles.title}
                    to={getCollectionLink(item)}
                    title={`[${item.id}]`}
                >
                    {item.title}
                </Link>
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

    function shouldDisplayMultipleCovers() {
        if (!showMultipleCovers || item._type === "release") {
            return false;
        }
        return item._type === "group"
            ? item.artists.length > 1
            : item.releases.length > 1;
    }

    function renderCover() {
        if (hideCover) {
            return null;
        }
        if (shouldDisplayMultipleCovers()) {
            return (
                <MultipleCovers
                    item={item as MultipleCoversProps["item"]}
                    onLoad={onLoad}
                    onError={onError}
                    onCoverDoubleClick={onCoverDoubleClick}
                    onMouseEnter={onMouseEnter}
                    isHover={isHover}
                />
            );
        }
        if (coverRelease) {
            return (
                <Cover
                    {...coverRelease}
                    onClick={onCoverClick}
                    className={styles.cover}
                    title={`${coverRelease.artist.name} - ${getReleaseTitle(
                        coverRelease
                    )}`}
                    onLoad={onLoad}
                    onError={onError}
                />
            );
        }
        return <div className={styles.ghost} />;
    }

    return (
        <MaybeDroppable
            item={item}
            render={({ canDrop }) => (
                <div
                    onMouseLeave={onMouseLeave}
                    className={cx(styles.listCard, {
                        [styles.loaded]: loaded,
                        [styles.isSingle]: isSingle,
                        [styles.selected]: selected,
                        [styles.hasFocus]: selected && hasFocus,
                        [styles.useDarkText]: useDarkText,
                        [styles.isHover]: isHover,
                        [styles.canDrop]: canDrop,
                        [styles.hideCover]: hideCover,
                        className,
                    })}
                    onClick={onClick}
                    onContextMenu={
                        isSingle
                            ? onContextMenu
                            : withStopPropagation(onContextMenu)
                    }
                    style={canDrop ? null : { background: color }}
                >
                    {renderCover()}
                    <div className={styles.content}>{getContent()}</div>
                </div>
            )}
        />
    );
}

type MultipleCoversProps = {
    item: CollectionWithReleases | ArtistWithReleases | GroupWithArtists;
    count?: number;
    isHover: boolean;
    onLoad: () => void;
    onError: () => void;
    onCoverDoubleClick?: (release_id: number) => void;
    onMouseEnter: () => void;
};

function MultipleCovers({
    item,
    count = 5,
    isHover,
    onLoad,
    onError,
    onCoverDoubleClick,
    onMouseEnter,
}: MultipleCoversProps) {
    const { coverRelease, otherReleases } = getCovers(item, count);

    return (
        <div
            onMouseEnter={onMouseEnter}
            className={cx(styles.multipleCovers, { [styles.isHover]: isHover })}
        >
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

type GetCovers = {
    coverRelease: ReleaseWithArtistAndSubreleases;
    otherReleases: ReleaseWithArtistAndSubreleases[];
};

function getCovers(item: MultipleCoversProps["item"], count = 5): GetCovers {
    const coverRelease = getCoverRelease(item);
    let otherReleases;
    if (item._type === "group") {
        otherReleases = item.artists
            .map(getCoverRelease)
            .filter((x) => x.id !== coverRelease.id)
            .slice(0, count - 1);
    } else {
        otherReleases = item.releases
            .filter((x) => x.id !== coverRelease.id)
            .slice(0, count - 1);
    }
    return {
        coverRelease,
        otherReleases,
    };
}

type MaybeDroppableProps = {
    item: Item;
    render: DroppableRender;
};

function MaybeDroppable({ item, render }: MaybeDroppableProps) {
    if (item._type === "group" || item._type === "collection") {
        return <Droppable item={item} render={render} />;
    }
    return render({ isOver: false, canDrop: false });
}
