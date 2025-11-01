import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import type { OpenDialogSyncOptions } from "electron";
import type { OpenFolderDialogParams, Settings } from "@/types/types";
import api from "../api";
import useStore from "../store";
import { isEmpty } from "@/lib/utils";
import Loading from "./Loading";

import { MdInfoOutline } from "react-icons/md";
import { IoFolderOpenOutline } from "react-icons/io5";
import cx from "clsx";
import styles from "./SettingsView.module.css";
import formStyles from "../forms.module.css";
import buttonStyles from "../buttons.module.css";

type SettingsViewProps = {
  closeModal: () => void;
};

type Field = {
  key: keyof Settings;
  type: "string" | "checkbox" | "path";
  required?: boolean;
  options?: {
    title?: string;
    defaultPath: string;
    properties?: OpenDialogSyncOptions["properties"];
    filters?: OpenDialogSyncOptions["filters"];
  };
};

const fieldsMap: Field[] = [
  {
    key: "USE_SMART_IMPORT",
    type: "checkbox",
  },
  {
    key: "LIBRARY_PATH",
    type: "path",
    options: {
      defaultPath: "~/Documents",
      properties: ["openDirectory"],
    },
  },
  {
    key: "PLAYER_PATH",
    type: "path",
    options: {
      title: "Insert the location your Player App",
      defaultPath: "/Applications",
      filters: [{ name: "Applications", extensions: [".app"] }],
    },
  },
  {
    key: "TAGGER_PATH",
    type: "path",
    options: {
      title: "Insert the location of your Tagger App",
      defaultPath: "/Applications",
      filters: [{ name: "Applications", extensions: [".app"] }],
    },
  },
  {
    key: "DISCOGS_KEY",
    type: "string",
  },
  {
    key: "DISCOGS_SECRET",
    type: "string",
  },
];

export default function SettingsView({ closeModal }: SettingsViewProps) {
  const { t } = useTranslation();
  const { settings, setSettings } = useStore();
  const [copy, setCopy] = useState(settings);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    await api.settings.updateSettings(copy);
    setSettings(copy);
    closeModal();
  }

  if (isEmpty(settings)) {
    return <Loading />;
  }

  async function openFile(
    key: string,
    options: Omit<OpenFolderDialogParams, "key">
  ) {
    const folder = await api.dialog.openFolderDialog({
      ...options,
      key,
    });
    if (!folder.length) {
      return;
    }
    setCopy((prev) => ({
      ...prev,
      [key]: folder.at(0),
    }));
  }

  function renderField({ key, type, required, options }: Field) {
    const className = formStyles[type === "checkbox" ? "checkbox" : "input"];
    return (
      <label key={key} className={formStyles.label}>
        <span>{t(`modals.SettingsView.fields.${key}.label`)}</span>
        <input
          type={type === "checkbox" ? "checkbox" : "input"}
          tabIndex={type === "path" ? -1 : 0}
          readOnly={type === "path"}
          onClick={type === "path" ? () => openFile(key, options) : null}
          name={key}
          className={className}
          required={required}
          placeholder={t(`modals.SettingsView.fields.${key}.placeholder`)}
          value={(copy[key] as string) || ""}
          checked={!!copy[key]}
          onChange={(event: FormEvent) =>
            setCopy((prev) => ({
              ...prev,
              [key]:
                type === "checkbox"
                  ? !prev[key]
                  : (event.target as HTMLInputElement).value,
            }))
          }
        />
        {type === "path" ? (
          <button
            className={cx(buttonStyles.button, formStyles.fileButton)}
            type="button"
            onClick={() => openFile(key, options)}
            aria-label={t(`modals.SettingsView.fields.${key}.label`)}
          >
            <IoFolderOpenOutline />
          </button>
        ) : null}
      </label>
    );
  }

  return (
    <div className={styles.view}>
      <h2 className={styles.title}>{t("modals.SettingsView.title")}</h2>
      <form onSubmit={onSubmit} className={formStyles.form}>
        {fieldsMap.map(renderField)}
        <div className={formStyles.info}>
          <MdInfoOutline />
          <a href={t("modals.SettingsView.discogs.link")} target="_blank">
            {t("modals.SettingsView.discogs.info")}
          </a>
        </div>
        <div className={formStyles.actions}>
          <button type="submit" className={formStyles.button}>
            {t("modals.SettingsView.actions.submit")}
          </button>
          <button
            type="button"
            className={formStyles.button}
            onClick={closeModal}
          >
            {t("modals.SettingsView.actions.cancel")}
          </button>
        </div>
      </form>
    </div>
  );
}
