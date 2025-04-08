import { useState } from "react";
import type { FormEvent } from "react";
import useRefetch from "../hooks/useRefetch";
import type { Artist } from "@/types/types";
import cx from "clsx";
import { MdInfoOutline } from "react-icons/md";
import styles from "./EditArtistView.module.css";
import formStyles from "../forms.module.css";

type NewInfo = {
    newPath: string;
    newName?: string;
};

type EditArtistViewProps = {
    artist: Artist;
    onSave: () => void;
    onCancel: () => void;
};

export default function EditArtistView({
    artist,
    onSave,
    onCancel,
}: EditArtistViewProps) {
    const refetch = useRefetch();
    const [artistInfo, setArtistInfo] = useState({
        newPath: artist.path,
        newName: artist.name,
    });

    async function onSubmit(event: FormEvent) {
        event.preventDefault();

        const success = await window.api.artist.editArtist({
            ...artist,
            ...artistInfo,
        });
        if (!success) {
            return;
        }

        refetch([["artists"], ["artists", "latest"], ["artists", artist.id]]);

        onSave();
    }

    function updateInfo(key: keyof NewInfo, value: string) {
        setArtistInfo((prev) => ({ ...prev, [key]: value }));
    }

    function canSubmit() {
        return (
            artist.name !== artistInfo.newName ||
            artist.path !== artistInfo.newPath
        );
    }

    return (
        <div className={styles.EditArtistView}>
            <h2>Edit Artist</h2>
            <form onSubmit={onSubmit} className={formStyles.form}>
                <label className={cx(formStyles.label, styles.label)}>
                    New Name
                    <input
                        autoFocus
                        className={cx(formStyles.input, styles.input)}
                        required
                        placeholder="Enter the artist name"
                        value={artistInfo.newName}
                        onInput={(event: FormEvent) =>
                            updateInfo(
                                "newName",
                                (event.target as HTMLInputElement).value
                            )
                        }
                    />
                </label>
                <label className={cx(formStyles.label, styles.label)}>
                    New Path
                    <input
                        className={cx(formStyles.input, styles.input)}
                        required
                        placeholder="Enter the artist path"
                        value={artistInfo.newPath}
                        onInput={(event: FormEvent) =>
                            updateInfo(
                                "newPath",
                                (event.target as HTMLInputElement).value
                            )
                        }
                    />
                </label>
                <div className={formStyles.info}>
                    <MdInfoOutline />
                    This will physically move the Artist folder in your Library.
                </div>
                <div className={formStyles.actions}>
                    <button
                        type="submit"
                        className={formStyles.button}
                        disabled={!canSubmit()}
                    >
                        Edit Artist
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
