import { useState } from "react";
import type { FormEvent } from "react";
import { useQueryClient } from "@tanstack/react-query";
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
    const queryClient = useQueryClient();
    const sortedReleases = releases.toSorted((a, b) =>
        a.title > b.title ? 1 : -1
    );

    const [discInfo, setDiscInfo] = useState<string[]>(
        sortedReleases.map((x) => x.title)
    );

    async function onSubmit(event: FormEvent) {
        event.preventDefault();

        await window.api.data.groupReleases({
            mainRelease: {
                title: (event.target as HTMLFormElement).mainReleaseTitle.value,
                id: sortedReleases[0].id,
            },
            discInfo: discInfo.map((title, index) => ({
                id: sortedReleases[index].id,
                title,
                number: index + 1,
            })),
        });

        [
            ["releases", "latest"],
            ["artists", sortedReleases[0].artist.id],
        ].forEach((queryKey) => queryClient.refetchQueries({ queryKey }));

        onSave();
    }

    return (
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
                        defaultValue={sortedReleases[0].title}
                    />
                </label>
                <ul className={styles.releaseList}>
                    {sortedReleases.map((release, index) => (
                        <li key={release.id}>
                            <article className={styles.release}>
                                <Cover className={styles.cover} {...release} />
                                <label
                                    className={cx(
                                        formStyles.label,
                                        formStyles.vertical,
                                        styles.label,
                                        styles.vertical
                                    )}
                                >
                                    {`Disc title for ${release.title}`}
                                    <input
                                        className={cx(
                                            formStyles.input,
                                            styles.input
                                        )}
                                        required
                                        placeholder="Enter disc title"
                                        value={discInfo[index]}
                                        onInput={(event: FormEvent) =>
                                            setDiscInfo((prev) =>
                                                prev.map((title, j) =>
                                                    j === index
                                                        ? (
                                                              event.target as HTMLInputElement
                                                          ).value
                                                        : title
                                                )
                                            )
                                        }
                                    />
                                </label>
                            </article>
                        </li>
                    ))}
                </ul>
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
    );
}
