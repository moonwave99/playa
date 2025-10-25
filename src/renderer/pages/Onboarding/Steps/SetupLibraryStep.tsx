import { useTranslation } from "react-i18next";
import { AnimatedLayout } from "../AnimatedLayout";
import { type StepProps } from "../Onboarding";
import api from "@/renderer/api";
import useStore from "@/renderer/store";

import cx from "clsx";
import { IoFolderOpenOutline } from "react-icons/io5";
import styles from "../Onboarding.module.css";
import formStyles from "../../../forms.module.css";

const chooseFolderOptions = {
  defaultPath: "~/Documents",
  properties: ["openDirectory" as const],
};

export default function SetupLibraryStep({ onCancel, onNextStep }: StepProps) {
  const { t } = useTranslation();

  const { settings, setSettings } = useStore();

  async function selectFolder() {
    const folder = await api.dialog.openFolderDialog(
      chooseFolderOptions.defaultPath,
      chooseFolderOptions.properties
    );
    if (!folder.length) {
      return;
    }
    setSettings({ ...settings, LIBRARY_PATH: folder.at(0) });
  }

  const isFolderSet = !!settings.LIBRARY_PATH;

  return (
    <AnimatedLayout>
      <header className={styles.header}>
        <h1>{t("pages.Onboarding.steps.setupLibrary.title")}</h1>
        <p>{t("pages.Onboarding.steps.setupLibrary.subtitle")}</p>
      </header>
      <div className={styles.folderWrapper}>
        {isFolderSet && (
          <input
            value={settings.LIBRARY_PATH}
            type="input"
            tabIndex={-1}
            readOnly
            className={formStyles.input}
            placeholder={t(
              "pages.Onboarding.steps.setupLibrary.chooseFolder.placeholder"
            )}
          />
        )}

        <button
          className={cx(
            formStyles.button,
            formStyles.primary,
            styles.button,
            styles.fileButton,
            { [styles.isFolderSet]: isFolderSet }
          )}
          type="button"
          onClick={selectFolder}
          aria-label={t(
            `modals.Onboarding.steps.setupLibrary.actions.chooseFolder.label`
          )}
        >
          <IoFolderOpenOutline />
          <span>
            {t("pages.Onboarding.steps.setupLibrary.chooseFolder.label")}
          </span>
        </button>
      </div>
      <div className={styles.actions}>
        <button
          className={cx(formStyles.button, formStyles.primary, styles.button)}
          onClick={onNextStep}
          disabled={!isFolderSet}
        >
          {t("pages.Onboarding.actions.nextStep")}
        </button>
        <button
          className={cx(formStyles.button, styles.button)}
          onClick={onCancel}
        >
          {t("pages.Onboarding.actions.cancel")}
        </button>
      </div>
    </AnimatedLayout>
  );
}
