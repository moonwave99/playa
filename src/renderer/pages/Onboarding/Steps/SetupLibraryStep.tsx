import { useTranslation } from "react-i18next";
import { useFocus } from "@/renderer/hooks/useFocus";
import { AnimatedLayout } from "../AnimatedLayout";
import { type StepProps } from "../Onboarding";
import api from "@/renderer/api";
import FolderPicker from "../FolderPicker";
import useStore from "@/renderer/store";

import cx from "clsx";
import styles from "../Onboarding.module.css";
import formStyles from "../../../forms.module.css";

const chooseFolderOptions = {
  defaultPath: "~/Documents",
  properties: ["openDirectory" as const],
};

export default function SetupLibraryStep({ onCancel, onNextStep }: StepProps) {
  const { t } = useTranslation();
  const { settings } = useStore();
  const isFolderSet = !!settings.LIBRARY_PATH;
  const { ref } = useFocus(isFolderSet);

  async function selectFolder() {
    const folder = await api.dialog.openFolderDialog({
      ...chooseFolderOptions,
      key: "LIBRARY_PATH",
    });
    if (!folder.length) {
      return;
    }
    await api.settings.updateSettings({
      ...settings,
      LIBRARY_PATH: folder.at(0),
    });
    focus();
  }

  return (
    <AnimatedLayout>
      <header className={styles.header}>
        <h1>{t("pages.Onboarding.steps.setupLibrary.title")}</h1>
        <p>{t("pages.Onboarding.steps.setupLibrary.subtitle")}</p>
      </header>
      <div className={styles.group}>
        <FolderPicker
          folderType="library"
          folder={settings.LIBRARY_PATH}
          onClick={selectFolder}
          autoFocus={!isFolderSet}
        />
      </div>
      <div className={styles.actions}>
        <button
          className={cx(formStyles.button, formStyles.primary, styles.button)}
          onClick={onNextStep}
          disabled={!isFolderSet}
          ref={ref}
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
