import { useTranslation } from "react-i18next";
import { AnimatedLayout } from "../AnimatedLayout";
import { type StepProps } from "../Onboarding";

import cx from "clsx";
import styles from "../Onboarding.module.css";
import formStyles from "@/renderer/forms.module.css";

export default function FinalStep({ onNextStep }: StepProps) {
  const { t } = useTranslation();

  return (
    <AnimatedLayout>
      <header className={styles.header}>
        <h1>{t("pages.Onboarding.steps.final.title")}</h1>
        <p>{t("pages.Onboarding.steps.final.subtitle")}</p>
      </header>
      <div className={styles.actions}>
        <button
          className={cx(formStyles.button, formStyles.primary, styles.button)}
          onClick={onNextStep}
          autoFocus
        >
          {t("pages.Onboarding.actions.gotoLibrary")}
        </button>
      </div>
    </AnimatedLayout>
  );
}
