import { useState } from "react";
import type { FormEvent } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from "@dnd-kit/core";
import {
    useSortable,
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { ReleaseWithArtist } from "@/types/types";
import Cover from "./Cover";

import cx from "clsx";
import styles from "./GroupReleasesView.module.css";
import formStyles from "../forms.module.css";

type GroupReleasesViewProps = {
    releases: ReleaseWithArtist[];
    onSave: () => void;
    onCancel: () => void;
};

export default function GroupReleasesView({
    releases,
    onSave,
    onCancel,
}: GroupReleasesViewProps) {
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );
    const queryClient = useQueryClient();

    const [discInfo, setDiscInfo] = useState(
        releases
            .toSorted((a, b) => (a.title > b.title ? 1 : -1))
            .map((x) => ({ ...x, discTitle: x.title }))
    );

    async function onSubmit(event: FormEvent) {
        event.preventDefault();

        await window.api.data.groupReleases({
            mainRelease: {
                title: (event.target as HTMLFormElement).mainReleaseTitle.value,
                id: discInfo[0].id,
            },
            discInfo: discInfo.map(({ id, discTitle }, index) => ({
                id,
                title: discTitle,
                number: index + 1,
            })),
        });

        [
            ["releases", "latest"],
            ["artists", discInfo[0].artist.id],
        ].forEach((queryKey) => queryClient.refetchQueries({ queryKey }));

        window.api.ui.clearSelection();
        onSave();
    }

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;
        if (active.id !== over.id) {
            setDiscInfo((prev) => {
                const oldIndex = prev.findIndex((x) => x.id === active.id);
                const newIndex = prev.findIndex((x) => x.id === over.id);
                return arrayMove(prev, oldIndex, newIndex);
            });
        }
    }

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
        >
            <SortableContext
                items={discInfo}
                strategy={verticalListSortingStrategy}
            >
                <div className={styles.GroupReleasesView}>
                    <h2>Group Releases</h2>
                    <form onSubmit={onSubmit} className={formStyles.form}>
                        <label className={cx(formStyles.label)}>
                            Main Release Title
                            <input
                                name="mainReleaseTitle"
                                className={formStyles.input}
                                required
                                placeholder="Enter disc title"
                                defaultValue={discInfo[0].title}
                            />
                        </label>
                        <ul className={styles.releaseList}>
                            {discInfo.map((release, index) => (
                                <li key={release.id}>
                                    <DiscView
                                        release={release}
                                        onInput={(event: FormEvent) =>
                                            setDiscInfo((prev) =>
                                                prev.map((x, j) =>
                                                    j === index
                                                        ? {
                                                              ...x,
                                                              discTitle: (
                                                                  event.target as HTMLInputElement
                                                              ).value,
                                                          }
                                                        : x
                                                )
                                            )
                                        }
                                    />
                                </li>
                            ))}
                        </ul>
                        <div className={formStyles.info}>
                            You can rearrange the order of discs.
                        </div>
                        <div className={formStyles.actions}>
                            <button type="submit" className={formStyles.button}>
                                Group Releases
                            </button>
                            <button
                                type="button"
                                className={formStyles.button}
                                onClick={onCancel}
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </SortableContext>
        </DndContext>
    );
}

type DiscViewProps = {
    release: ReleaseWithArtist & { discTitle: string };
    onInput: (event: FormEvent) => void;
};

function DiscView({ release, onInput }: DiscViewProps) {
    const { attributes, listeners, setNodeRef, transform, transition } =
        useSortable({ id: release.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <article className={styles.release} ref={setNodeRef} style={style}>
            <div {...attributes} {...listeners}>
                <Cover
                    className={styles.cover}
                    droppable={false}
                    {...release}
                />
            </div>
            <label
                className={cx(
                    formStyles.label,
                    formStyles.vertical,
                    styles.label,
                    styles.vertical
                )}
            >
                Disc title for: {release.title}
                <input
                    className={cx(formStyles.input, styles.input)}
                    required
                    placeholder="Enter disc title"
                    value={release.discTitle}
                    onInput={onInput}
                />
            </label>
        </article>
    );
}
