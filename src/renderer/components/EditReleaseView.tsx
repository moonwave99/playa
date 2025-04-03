import { useState } from "react";
import type { FormEvent } from "react";
import useRefetch from "../hooks/useRefetch";
import type {
    ReleaseWithArtist,
    ReleaseWithArtistAndSubreleases,
} from "@/types/types";
import cx from "clsx";
import { MdInfoOutline } from "react-icons/md";
import styles from "./EditReleaseView.module.css";
import formStyles from "../forms.module.css";

const labelMap = {
    newTitle: {
        label: "New Title",
        placeholder: "Enter new title",
    },
    newDiscTitle: {
        label: "New Disc Title",
        placeholder: "Enter new disc title",
    },
    newPath: {
        label: "New Path",
        placeholder: "Enter new path",
    },
};

type NewInfo = {
    newPath: string;
    newDiscTitle: string;
    newTitle?: string;
};

type EditReleasesViewProps = {
    release: ReleaseWithArtistAndSubreleases;
    onSave: () => void;
    onCancel: () => void;
};

export default function EditReleasesView({
    release,
    onSave,
    onCancel,
}: EditReleasesViewProps) {
    const refetch = useRefetch();
    const [folderInfo, setFolderInfo] = useState(
        [release, ...release.subReleases].map((x, index) => ({
            ...x,
            newPath: x.path,
            newDiscTitle: x.discTitle || `Disc ${index + 1}`,
            newTitle: x.title,
        }))
    );

    async function onSubmit(event: FormEvent) {
        event.preventDefault();
        const success = await window.api.system.renameRelease(
            folderInfo
                .filter(
                    (x) =>
                        x.path !== x.newPath ||
                        x.discTitle !== x.newDiscTitle ||
                        x.title !== x.newTitle
                )
                .map((x) => ({ ...x, newTitle: folderInfo[0].newTitle }))
        );
        if (!success) {
            return;
        }

        refetch([
            ["releases", "latest"],
            ["releases", release.id],
            ["artists", release.artist_id],
        ]);

        window.api.state.selectReleases([]);
        onSave();
    }

    function updateInfo(index: number, key: keyof NewInfo, value: string) {
        setFolderInfo((prev) =>
            prev.map((x, j) => (j === index ? { ...x, [key]: value } : x))
        );
    }

    return (
        <div className={styles.EditReleaseView}>
            <h2>Edit Release</h2>
            <form onSubmit={onSubmit} className={formStyles.form}>
                <ul className={styles.releaseList}>
                    {folderInfo.map((release, index) => (
                        <li key={release.id}>
                            <FolderView
                                hasFocus={index === 0}
                                isMainRelease={index === 0}
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
                        Edit Release
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
    release: NewInfo & Pick<ReleaseWithArtist, "title" | "discTitle">;
    isMainRelease?: boolean;
    hasMultipleDiscs: boolean;
    hasFocus?: boolean;
    onInput: (key: keyof NewInfo, value: string) => void;
};

function FolderView({
    release,
    isMainRelease,
    hasMultipleDiscs,
    hasFocus,
    onInput,
}: FolderViewProps) {
    function getTitle() {
        if (isMainRelease || !hasMultipleDiscs || !release.discTitle) {
            return release.title;
        }
        return `${release.title} - ${release.discTitle}`;
    }

    return (
        <article className={styles.release}>
            <h3 className={styles.releaseTitle}>{getTitle()}</h3>
            {isMainRelease ? (
                <Field
                    hasFocus
                    name="newTitle"
                    release={release}
                    onInput={onInput}
                />
            ) : null}
            <Field
                hasFocus={hasFocus && !isMainRelease}
                name="newPath"
                release={release}
                onInput={onInput}
            />
            {hasMultipleDiscs ? (
                <Field
                    name="newDiscTitle"
                    release={release}
                    onInput={onInput}
                />
            ) : null}
        </article>
    );
}

type FieldProps = Pick<FolderViewProps, "release" | "onInput" | "hasFocus"> & {
    name: keyof NewInfo;
};

function Field({ name, release, hasFocus, onInput }: FieldProps) {
    return (
        <label className={cx(formStyles.label, styles.label)}>
            {labelMap[name].label}
            <input
                autoFocus={hasFocus}
                className={cx(formStyles.input, styles.input)}
                required
                placeholder={labelMap[name].placeholder}
                value={release[name]}
                onInput={(event: FormEvent) =>
                    onInput(name, (event.target as HTMLInputElement).value)
                }
            />
        </label>
    );
}
