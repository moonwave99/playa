import type { FormEvent } from "react";
import useSettings from "../hooks/useSettings";
import styles from "./SettingsView.module.css";
import Loading from "./Loading";
import { isEmpty } from "@/lib/utils";
import type { Settings } from "@/types/types";

type SettingsViewProps = {
    onSave: () => void;
    onCancel: () => void;
};

const fieldsMap = [
    {
        key: "LIBRARY_PATH",
        label: "Library Path",
        placeholder: "Insert the folder where your music is located",
    },
    {
        key: "COVERS_PATH",
        label: "Cover Path",
        placeholder: "Insert the folder where the artwork is downloaded",
    },
    {
        key: "PLAYER_PATH",
        label: "Player Path",
        placeholder: "Insert the location of the Player App",
    },
    {
        key: "TAGGER_PATH",
        label: "Tagger Path",
        placeholder: "Insert the location of the Tagger App",
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
    const { settings, saveSettings } = useSettings();

    async function onSubmit(event: FormEvent) {
        event.preventDefault();
        const newEntries = Object.fromEntries(
            new FormData(event.target as HTMLFormElement)
        ) as Settings;
        await saveSettings(newEntries);
        onSave();
    }

    if (isEmpty(settings)) {
        return <Loading />;
    }

    return (
        <div className={styles.view}>
            <h2 className={styles.title}>Settings</h2>
            <form onSubmit={onSubmit} className={styles.form}>
                {fieldsMap.map(({ key, label, placeholder }) => (
                    <label key={key}>
                        <span>{label}</span>
                        <input
                            name={key}
                            required
                            placeholder={placeholder}
                            defaultValue={(settings[key] as string) || ""}
                        />
                    </label>
                ))}
                <a
                    className={styles.info}
                    href="https://www.discogs.com/settings/developers"
                    target="_blank"
                >
                    You can set up your Discogs Credentials from here
                </a>
                <div className={styles.actions}>
                    <button type="submit">Save Settings</button>
                    <button type="button" onClick={onCancel}>
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}
