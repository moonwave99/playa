import { useState } from "react";
import { useTranslation } from "react-i18next";
import { AnimatedLayout } from "../AnimatedLayout";
import { type StepProps } from "../Onboarding";

import cx from "clsx";
import styles from "../Onboarding.module.css";
import formStyles from "../../../forms.module.css";

export default function SetupLibraryStep({ onCancel, onNextStep }: StepProps) {
  const { t } = useTranslation();

  const [folder, setFolder] = useState(null);

  return (
    <AnimatedLayout>
      <header className={styles.header}>
        <h1>{t("pages.Onboarding.steps.setupLibrary.title")}</h1>
        <p>{t("pages.Onboarding.steps.setupLibrary.subtitle")}</p>
      </header>
      <div className={styles.actions}>
        <button
          className={cx(formStyles.button, formStyles.primary, styles.button)}
          onClick={onNextStep}
          disabled={!folder}
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
