import { useState } from "react";
import type { FormEvent } from "react";
import useRefetch from "../hooks/useRefetch";
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

type NewInfo = {
    newPath: string;
    newDiscTitle: string;
};

export default function RenameReleasesView({
    release,
    onSave,
    onCancel,
}: RenameReleasesViewProps) {
    const refetch = useRefetch();
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
            folderInfo.filter(
                (x) => x.path !== x.newPath || x.discTitle !== x.newDiscTitle
            )
        );
        if (!success) {
            return;
        }

        refetch([
            ["releases", "latest"],
            ["releases", release.id],
            ["artists", release.artist_id],
        ]);

        window.api.ui.clearSelection();
        onSave();
    }

    function updateInfo(index: number, key: keyof NewInfo, value: string) {
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
    release: ReleaseWithArtist & NewInfo;
    hasMultipleDiscs: boolean;
    onInput: (key: keyof NewInfo, value: string) => void;
};

function FolderView({ release, hasMultipleDiscs, onInput }: FolderViewProps) {
    function getTitle() {
        if (!hasMultipleDiscs || !release.discTitle) {
            return release.title;
        }

        return `${release.title} - ${release.discTitle}`;
    }

    return (
        <article className={styles.release}>
            <h3 className={styles.releaseTitle}>{getTitle()}</h3>
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
