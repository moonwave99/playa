import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import type { ArtistWithReleases } from "@/types/types";
import useStore from "../store";
import useRefetch from "../hooks/useRefetch";
import api from "../api";
import RelatedArtistsEditor from "./RelatedArtistsEditor";

import cx from "clsx";
import { MdInfoOutline } from "react-icons/md";
import styles from "./EditArtistView.module.css";
import formStyles from "../forms.module.css";

type NewInfo = {
  newPath: string;
  newName?: string;
};

type EditArtistViewProps = {
  artist: ArtistWithReleases;
  onSave: () => void;
  onCancel: () => void;
};

export default function EditArtistView({
  artist,
  onSave,
  onCancel,
}: EditArtistViewProps) {
  const { t } = useTranslation();
  const { settings } = useStore();
  const refetch = useRefetch();
  const [artistInfo, setArtistInfo] = useState({
    newPath: artist.path,
    newName: artist.name,
  });

  async function onSubmit(event: FormEvent) {
    event.preventDefault();

    const success = await api.artist.editArtist({
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
      artist.name !== artistInfo.newName || artist.path !== artistInfo.newPath
    );
  }

  const { USE_SMART_IMPORT } = settings;

  return (
    <div className={styles.EditArtistView}>
      <div className={cx(formStyles.container, formStyles.separator)}>
        <h2>{t("modals.EditArtistView.title")}</h2>
        <form onSubmit={onSubmit} className={formStyles.form}>
          <label className={cx(formStyles.label, styles.label)}>
            {t("modals.EditArtistView.fields.name.label")}
            <input
              autoFocus
              className={cx(formStyles.input, styles.input)}
              required
              placeholder={t("modals.EditArtistView.fields.name.placeholder")}
              value={artistInfo.newName}
              onInput={(event: FormEvent) =>
                updateInfo("newName", (event.target as HTMLInputElement).value)
              }
            />
          </label>
          {USE_SMART_IMPORT && (
            <label className={cx(formStyles.label, styles.label)}>
              {t("modals.EditArtistView.fields.path.label")}
              <input
                className={cx(formStyles.input, styles.input)}
                required
                placeholder={t("modals.EditArtistView.fields.path.label")}
                value={artistInfo.newPath}
                onInput={(event: FormEvent) =>
                  updateInfo(
                    "newPath",
                    (event.target as HTMLInputElement).value
                  )
                }
              />
            </label>
          )}

          <div className={formStyles.actions}>
            {USE_SMART_IMPORT && (
              <div className={formStyles.info}>
                <MdInfoOutline />
                {t("modals.EditArtistView.moveInfo")}
              </div>
            )}
            <button
              type="submit"
              className={formStyles.button}
              disabled={!canSubmit()}
            >
              {t("modals.EditArtistView.actions.submit")}
            </button>
            <button
              type="button"
              className={formStyles.button}
              onClick={onCancel}
            >
              {t("modals.EditArtistView.actions.cancel")}
            </button>
          </div>
        </form>
      </div>
      <RelatedArtistsEditor id={artist.id} />
    </div>
  );
}
