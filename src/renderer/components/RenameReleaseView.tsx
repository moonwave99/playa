import { useState } from "react";
import type { FormEvent } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type {
    ReleaseWithArtist,
    ReleaseWithArtistAndSubreleases,
} from "@/types/types";
import cx from "clsx";
import { MdInfoOutline } from "react-icons/md";
import styles from "./RenameReleaseView.module.css";
import formStyles from "../forms.module.css";

type RenameReleasesViewProps = {
    release: ReleaseWithArtistAndSubreleases;
    onSave: () => void;
    onCancel: () => void;
};

export default function RenameReleasesView({
    release,
    onSave,
    onCancel,
}: RenameReleasesViewProps) {
    const queryClient = useQueryClient();
    const [folderInfo, setFolderInfo] = useState(
        [release, ...release.subReleases].map((x, index) => ({
            ...x,
            newPath: x.path,
            newDiscTitle: x.discTitle || `Disc ${index + 1}`,
        }))
    );

    async function onSubmit(event: FormEvent) {
        event.preventDefault();
        const success = await window.api.system.renameRelease(
            folderInfo.filter((x) => x.path !== x.newPath)
        );
        if (!success) {
            return;
        }

        [
            ["releases", "latest"],
            ["releases", release.id],
            ["artists", release.artist_id],
        ].forEach((queryKey) => queryClient.refetchQueries({ queryKey }));

        window.api.ui.clearSelection();
        onSave();
    }

    function updateInfo(
        index: number,
        key: "newPath" | "newDiscTitle",
        value: string
    ) {
        setFolderInfo((prev) =>
            prev.map((x, j) => (j === index ? { ...x, [key]: value } : x))
        );
    }

    return (
        <div className={styles.RenameReleaseView}>
            <h2>Rename Release</h2>
            <form onSubmit={onSubmit} className={formStyles.form}>
                <ul className={styles.releaseList}>
                    {folderInfo.map((release, index) => (
                        <li key={release.id}>
                            <FolderView
                                hasMultipleDiscs={folderInfo.length > 1}
                                release={release}
                                onInput={(key, value) =>
                                    updateInfo(index, key, value)
                                }
                            />
                        </li>
                    ))}
                </ul>
                <div className={formStyles.info}>
                    <MdInfoOutline />
                    This will physically move the Release folder in your
                    Library.
                </div>
                <div className={formStyles.actions}>
                    <button type="submit" className={formStyles.button}>
                        Rename Release
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

type FolderViewProps = {
    release: ReleaseWithArtist & { newPath: string; newDiscTitle: string };
    hasMultipleDiscs: boolean;
    onInput: (key: "newPath" | "newDiscTitle", value: string) => void;
};

function FolderView({ release, hasMultipleDiscs, onInput }: FolderViewProps) {
    const title = `${release.title}${
        hasMultipleDiscs ? ` - ${release.discTitle}` : ""
    }`;
    return (
        <article className={styles.release}>
            <h3 className={styles.releaseTitle}>{title}</h3>
            <label className={cx(formStyles.label, styles.label)}>
                New Path
                <input
                    className={cx(formStyles.input, styles.input)}
                    required
                    placeholder="Enter new path"
                    value={release.newPath}
                    onInput={(event: FormEvent) =>
                        onInput(
                            "newPath",
                            (event.target as HTMLInputElement).value
                        )
                    }
                />
            </label>
            {hasMultipleDiscs && (
                <label className={cx(formStyles.label, styles.label)}>
                    New Disc Title
                    <input
                        className={cx(formStyles.input, styles.input)}
                        required
                        placeholder="Enter new disc title"
                        value={release.newDiscTitle}
                        onInput={(event: FormEvent) =>
                            onInput(
                                "newDiscTitle",
                                (event.target as HTMLInputElement).value
                            )
                        }
                    />
                </label>
            )}
        </article>
    );
}
