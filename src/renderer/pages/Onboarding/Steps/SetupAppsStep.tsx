import { useTranslation } from "react-i18next";
import { useFocus } from "@/renderer/hooks/useFocus";
import useStore from "@/renderer/store";
import { AnimatedLayout } from "../AnimatedLayout";
import { type StepProps } from "../Onboarding";
import api from "@/renderer/api";
import FolderPicker from "../FolderPicker";

import cx from "clsx";
import styles from "../Onboarding.module.css";
import formStyles from "../../../forms.module.css";

const chooseFolderOptions = {
  defaultPath: "/Applications",
  properties: ["openFile" as const],
  filters: [{ name: "Applications", extensions: [".app"] }],
};

export default function SetupApps({ onCancel, onNextStep }: StepProps) {
  const { t } = useTranslation();
  const { settings } = useStore();
  const { ref, focus } = useFocus(true);

  async function selectFolder(app: "PLAYER_PATH" | "TAGGER_PATH") {
    const folder = await api.dialog.openFolderDialog({
      ...chooseFolderOptions,
      key: app,
    });
    if (!folder.length) {
      return;
    }
    await api.settings.updateSettings({
      ...settings,
      [app]: folder.at(0),
    });
    focus();
  }

  return (
    <AnimatedLayout>
      <header className={styles.header}>
        <h1>{t("pages.Onboarding.steps.setupApps.title")}</h1>
        <p>{t("pages.Onboarding.steps.setupApps.subtitle")}</p>
      </header>
      <div className={styles.group}>
        <FolderPicker
          folderType="player"
          folder={settings.PLAYER_PATH}
          onClick={() => selectFolder("PLAYER_PATH")}
        />
        <FolderPicker
          folderType="tagger"
          folder={settings.TAGGER_PATH}
          onClick={() => selectFolder("TAGGER_PATH")}
        />
      </div>
      <div className={styles.actions}>
        <button
          className={cx(formStyles.button, formStyles.primary, styles.button)}
          onClick={onNextStep}
          ref={ref}
          tabIndex={1}
        >
          {t("pages.Onboarding.actions.nextStep")}
        </button>
        <button
          className={cx(formStyles.button, styles.button)}
          onClick={onCancel}
          tabIndex={1}
        >
          {t("pages.Onboarding.actions.cancel")}
        </button>
      </div>
    </AnimatedLayout>
  );
}
