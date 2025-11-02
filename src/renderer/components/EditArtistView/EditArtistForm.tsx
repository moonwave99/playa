import { useState, FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { ArtistWithReleases } from "@/types/types";
import useStore from "@/renderer/store";

import { Icon } from "@/renderer/icons";
import cx from "clsx";
import styles from "./EditArtistView.module.css";
import formStyles from "@/renderer/forms.module.css";

type EditArtistFormProps = {
  artist: ArtistWithReleases;
  onSubmit: (info: NewInfo) => void;
  onCancel: () => void;
};

export type NewInfo = {
  newPath: string;
  newName?: string;
};

export default function EditArtistForm({
  onSubmit,
  artist,
  onCancel,
}: EditArtistFormProps) {
  const { t } = useTranslation();
  const { settings } = useStore();

  const [artistInfo, setArtistInfo] = useState({
    newPath: artist.path,
    newName: artist.name,
  });

  async function _onSubmit(event: FormEvent) {
    event.preventDefault();
    onSubmit(artistInfo);
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
    <form onSubmit={_onSubmit} className={formStyles.form}>
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
              updateInfo("newPath", (event.target as HTMLInputElement).value)
            }
          />
        </label>
      )}

      <div className={formStyles.actions}>
        {USE_SMART_IMPORT && (
          <div className={formStyles.info}>
            <Icon isFor="modal.info" />
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
        <button type="button" className={formStyles.button} onClick={onCancel}>
          {t("modals.EditArtistView.actions.cancel")}
        </button>
      </div>
    </form>
  );
}
