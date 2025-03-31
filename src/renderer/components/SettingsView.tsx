import { useState } from "react";
import type { OpenDialogSyncOptions } from "electron";
import type { FormEvent } from "react";
import useStore from "../store";
import Loading from "./Loading";
import { isEmpty } from "@/lib/utils";

import { MdInfoOutline } from "react-icons/md";
import { IoFolderOpenOutline } from "react-icons/io5";
import cx from "clsx";
import styles from "./SettingsView.module.css";
import formStyles from "../forms.module.css";
import buttonStyles from "../buttons.module.css";

type SettingsViewProps = {
    onSave: () => void;
    onCancel: () => void;
};

const fieldsMap = [
    {
        key: "LIBRARY_PATH",
        label: "Library Path",
        placeholder: "Insert the folder where your music is located",
        type: "path",
        options: {
            defaultPath: "~/Documents",
            properties: ["openDirectory" as const],
        },
    },
    {
        key: "COVERS_PATH",
        label: "Cover Path",
        placeholder: "Insert the folder where the artwork is downloaded",
        type: "path",
        options: {
            defaultPath: "~/Documents",
            properties: ["openDirectory" as const],
        },
    },
    {
        key: "PLAYER_PATH",
        label: "Player Path",
        placeholder: "Insert the location of the Player App",
        type: "path",
        options: {
            title: "Insert the location of the Player App",
            defaultPath: "/Applications",
            filters: [{ name: "Applications", extensions: [".app"] }],
        },
    },
    {
        key: "TAGGER_PATH",
        label: "Tagger Path",
        placeholder: "Insert the location of the Tagger App",
        type: "path",
        options: {
            title: "Insert the location of the Tagger App",
            defaultPath: "/Applications",
            filters: [{ name: "Applications", extensions: [".app"] }],
        },
    },
    {
        key: "DISCOGS_KEY",
        label: "Discogs Key",
        placeholder: "Insert your Discogs API key",
    },
    {
        key: "DISCOGS_SECRET",
        label: "Discogs Secret",
        placeholder: "Insert your Discogs API Secret",
    },
];

export default function SettingsView({ onSave, onCancel }: SettingsViewProps) {
    const { settings, setSettings } = useStore();
    const [copy, setCopy] = useState(settings);

    async function onSubmit(event: FormEvent) {
        event.preventDefault();
        await window.api.settings.setSettings(copy);
        setSettings(copy);
        onSave();
    }

    if (isEmpty(settings)) {
        return <Loading />;
    }

    async function openFile(
        key: string,
        options: Partial<OpenDialogSyncOptions>
    ) {
        const path = await window.api.dialog.open(options);
        if (!path) {
            return;
        }
        setCopy((prev) => ({
            ...prev,
            [key]: path,
        }));
    }

    return (
        <div className={styles.view}>
            <h2 className={styles.title}>Settings</h2>
            <form onSubmit={onSubmit} className={formStyles.form}>
                {fieldsMap.map(({ key, label, placeholder, type, options }) => (
                    <label key={key} className={formStyles.label}>
                        <span>{label}</span>
                        <input
                            tabIndex={type === "path" ? -1 : 0}
                            readOnly={type === "path"}
                            onClick={
                                type === "path"
                                    ? () => openFile(key, options)
                                    : null
                            }
                            name={key}
                            className={formStyles.input}
                            required
                            placeholder={placeholder}
                            value={(copy[key] as string) || ""}
                            onInput={(event: FormEvent) =>
                                setCopy((prev) => ({
                                    ...prev,
                                    [key]: (event.target as HTMLInputElement)
                                        .value,
                                }))
                            }
                        />
                        {type === "path" ? (
                            <button
                                className={cx(
                                    buttonStyles.button,
                                    styles.fileButton
                                )}
                                type="button"
                                onClick={() => openFile(key, options)}
                                aria-label={`Choose a location for ${label}`}
                            >
                                <IoFolderOpenOutline />
                            </button>
                        ) : null}
                    </label>
                ))}
                <div className={formStyles.info}>
                    <MdInfoOutline />
                    <a
                        href="https://www.discogs.com/settings/developers"
                        target="_blank"
                    >
                        You can set up your Discogs Credentials from here
                    </a>
                </div>
                <div className={formStyles.actions}>
                    <button type="submit" className={formStyles.button}>
                        Save Settings
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
