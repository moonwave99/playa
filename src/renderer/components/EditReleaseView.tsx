import { useState } from "react";
import type { FormEvent } from "react";
import api from "../api";
import useRefetch from "../hooks/useRefetch";
import type {
    ReleaseType,
    ReleaseWithArtist,
    ReleaseWithArtistAndSubreleases,
    NewReleaseInfo,
} from "@/types/types";
import { didReleaseInfoChange } from "@/lib/utils";
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
    newYear: {
        label: "New Year",
        placeholder: "Enter new year",
    },
    newType: {
        label: "New Release Type",
        placeholder: "Enter new release type",
    },
};

const releaseTypes = [
    "Album",
    "EP",
    "Single",
    "Compilation",
    "Bootleg",
    "Various",
    "Tribute",
    "Soundtrack",
] as ReleaseType[];

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
            newDiscTitle:
                release.subReleases.length === 0
                    ? x.discTitle
                    : x.discTitle || `Disc ${index + 1}`,
            newTitle: x.title,
            newYear: x.year,
            newType: x.type,
        }))
    );

    async function onSubmit(event: FormEvent) {
        event.preventDefault();
        const success = await api.release.editRelease(
            folderInfo
                .filter(
                    (x) =>
                        x.path !== x.newPath ||
                        x.discTitle !== x.newDiscTitle ||
                        x.title !== x.newTitle
                )
                .map((x) => ({
                    ...x,
                    newTitle: folderInfo[0].newTitle,
                    newType: folderInfo[0].newType,
                    newYear: folderInfo[0].newYear,
                }))
        );
        if (!success) {
            return;
        }

        refetch([
            ["releases", "latest"],
            ["releases", release.id],
            ["artists", release.artist_id],
        ]);

        api.state.selectReleases([]);
        onSave();
    }

    function updateInfo(
        index: number,
        key: keyof NewReleaseInfo,
        value: string | number
    ) {
        setFolderInfo((prev) =>
            prev.map((x, j) => (j === index ? { ...x, [key]: value } : x))
        );
    }

    function canSubmit() {
        return didReleaseInfoChange(folderInfo, folderInfo.length === 1);
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
                    <button
                        type="submit"
                        className={formStyles.button}
                        disabled={!canSubmit()}
                    >
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
    release: NewReleaseInfo & Pick<ReleaseWithArtist, "title" | "discTitle">;
    isMainRelease?: boolean;
    hasMultipleDiscs: boolean;
    hasFocus?: boolean;
    onInput: (key: keyof NewReleaseInfo, value: string | number) => void;
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
                <>
                    <div className={formStyles.horizontalGroup}>
                        <Field
                            name="newYear"
                            release={release}
                            onInput={onInput}
                            type="number"
                        />
                        <ReleaseTypeField release={release} onInput={onInput} />
                    </div>
                    <Field
                        hasFocus
                        name="newTitle"
                        release={release}
                        onInput={onInput}
                    />
                </>
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
    name: keyof NewReleaseInfo;
    type?: string;
};

function Field({
    name,
    release,
    hasFocus,
    onInput,
    type = "text",
}: FieldProps) {
    return (
        <label className={cx(formStyles.label, styles.label)}>
            {labelMap[name].label}
            <input
                type={type}
                autoFocus={hasFocus}
                className={cx(formStyles.input, styles.input)}
                required
                placeholder={labelMap[name].placeholder}
                value={release[name]}
                onInput={(event: FormEvent) => {
                    const value = (event.target as HTMLInputElement).value;
                    onInput(name, type === "number" ? +value : value);
                }}
            />
        </label>
    );
}

type ReleaseTypeFieldProps = Omit<FieldProps, "name">;

function ReleaseTypeField({
    release,
    hasFocus,
    onInput,
}: ReleaseTypeFieldProps) {
    return (
        <label className={cx(formStyles.label, styles.label)}>
            {labelMap.newType.label}
            <select
                className={cx(formStyles.select, styles.select)}
                autoFocus={hasFocus}
                required
                value={release.newType}
                onChange={(event: FormEvent) =>
                    onInput("newType", (event.target as HTMLInputElement).value)
                }
            >
                {releaseTypes.map((type) => (
                    <option key={type}>{type}</option>
                ))}
            </select>
        </label>
    );
}
