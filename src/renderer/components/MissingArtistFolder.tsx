import { FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { Artist } from "@/types/types";
import cx from "clsx";
import styles from "./MissingArtistFolder.module.css";
import formStyles from "../forms.module.css";
import api from "../api";

type MissingArtistFolderProps = {
  artist: Artist;
  commonMissingPath: string;
  closeModal: () => void;
};

export default function MissingArtistFolder({
  artist,
  commonMissingPath,
  closeModal,
}: MissingArtistFolderProps) {
  const { t } = useTranslation();
  const { relocateArtist } = useMissingArtistFolder({
    artist,
    commonMissingPath,
    onDone: closeModal,
  });

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    relocateArtist(
      !!(event.target as HTMLFormElement).warnOnContentDifference.checked
    );
  }

  return (
    <div className={styles.view}>
      <form onSubmit={onSubmit} className={formStyles.form}>
        <h2>{t(`modals.MissingArtistFolder.title`)}</h2>
        <p className={styles.description}>
          {t(`modals.MissingArtistFolder.description.0`)}
        </p>
        <p className={styles.commonPath}>{commonMissingPath}</p>
        <p className={styles.description}>
          {t(`modals.MissingArtistFolder.description.1`)}
        </p>
        <div className={cx(formStyles.actions, styles.actions)}>
          <label
            className={cx(formStyles.label, styles.warnOnContentDifference)}
          >
            {t(
              `modals.MissingReleaseFolder.fields.warnOnContentDifference.label`
            )}
            <input
              type="checkbox"
              className={formStyles.checkbox}
              name="warnOnContentDifference"
              defaultChecked
            />
          </label>
          <button
            type="submit"
            className={cx(formStyles.button, formStyles.primary)}
            autoFocus
          >
            {t("modals.MissingArtistFolder.actions.relocate")}
          </button>
          <button
            type="button"
            className={formStyles.button}
            onClick={closeModal}
          >
            {t("modals.MissingArtistFolder.actions.cancel")}
          </button>
        </div>
      </form>
    </div>
  );
}

type UseMissingArtistFolderParams = {
  artist: Artist;
  commonMissingPath: string;
  onDone: () => void;
};

type UseMissingArtistFolder = {
  relocateArtist: (warnOnContentDifference: ConstrainBoolean) => void;
};

function useMissingArtistFolder({
  artist,
  commonMissingPath,
  onDone,
}: UseMissingArtistFolderParams): UseMissingArtistFolder {
  async function relocateArtist(warnOnContentDifference: boolean) {
    const result = await api.artist.relocateArtistFolder(artist.id, {
      commonMissingPath,
      warnOnContentDifference,
    });
    if (!result) {
      return;
    }
    onDone();
  }

  return { relocateArtist };
}
