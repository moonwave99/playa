import { FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { Release } from "@/types/types";
import api from "../api";
import cx from "clsx";
import styles from "./MissingReleaseFolder.module.css";
import formStyles from "../forms.module.css";

type MissingReleaseFolderProps = {
  release: Release;
  closeModal: () => void;
};

export default function MissingReleaseFolder({
  release,
  closeModal,
}: MissingReleaseFolderProps) {
  const { t } = useTranslation();
  const { deleteRelease, relocateRelease } = useMissingReleaseFolder({
    release,
    onDone: closeModal,
  });

  // #TODO:
  // (all in a custom hook)
  // ## delete
  // - use existing delete function
  // ## relocate
  // - add controller function
  // - check if contents match (block modal)
  // - user chooses - cancel or keep new

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    relocateRelease(
      !!(event.target as HTMLFormElement).warnOnContentDifference.checked
    );
  }

  return (
    <div className={styles.view}>
      <form onSubmit={onSubmit} className={formStyles.form}>
        <h2>{t(`modals.MissingReleaseFolder.title`)}</h2>
        <p className={styles.description}>
          {t(`modals.MissingReleaseFolder.description`)}
        </p>
        <div className={cx(formStyles.actions, styles.actions)}>
          <label className={formStyles.label}>
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
          >
            {t("modals.MissingReleaseFolder.actions.relocate")}
          </button>
          <button
            type="button"
            className={formStyles.button}
            onClick={deleteRelease}
          >
            {t("modals.MissingReleaseFolder.actions.delete")}
          </button>
          <button
            type="button"
            className={formStyles.button}
            onClick={closeModal}
          >
            {t("modals.MissingReleaseFolder.actions.cancel")}
          </button>
        </div>
      </form>
    </div>
  );
}

type UseMissingReleaseFolderParams = {
  release: Release;
  onDone: () => void;
};

function useMissingReleaseFolder({
  release,
  onDone,
}: UseMissingReleaseFolderParams) {
  async function relocateRelease(warnOnContentDifference: boolean) {
    const result = await api.release.relocateRelease(release.id, {
      warnOnContentDifference,
    });
    if (!result) {
      return;
    }
    onDone();
  }

  async function deleteRelease() {
    await api.release.deleteReleases([release.id]);
    onDone();
  }

  return { relocateRelease, deleteRelease };
}
