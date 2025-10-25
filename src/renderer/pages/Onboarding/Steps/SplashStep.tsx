import { useTranslation, Trans } from "react-i18next";
import { AnimatedLayout } from "../AnimatedLayout";
import { type StepProps } from "../Onboarding";

import cx from "clsx";
import logo from "../../../../assets/logo.png";
import styles from "../Onboarding.module.css";
import formStyles from "../../../forms.module.css";

export default function SplashStep({ onCancel, onNextStep }: StepProps) {
  const { t } = useTranslation();

  return (
    <AnimatedLayout>
      <header className={styles.header}>
        <h1>{t("pages.Onboarding.steps.splash.title")}</h1>
        <p>{t("pages.Onboarding.steps.splash.subtitle")}</p>
      </header>
      <img src={logo} className={styles.logo} />
      <p className={styles.description}>
        {t("pages.Onboarding.steps.splash.description")}
      </p>
      <div className={styles.actions}>
        <button
          className={cx(formStyles.button, formStyles.primary, styles.button)}
          onClick={onNextStep}
        >
          {t("pages.Onboarding.actions.start")}
        </button>
        <button
          className={cx(formStyles.button, styles.button)}
          onClick={onCancel}
        >
          {t("pages.Onboarding.actions.cancel")}
        </button>
      </div>
      <footer className={styles.footer}>
        <Trans
          i18nKey="pages.Onboarding.copyright"
          components={{
            a: <a />,
          }}
        />
      </footer>
    </AnimatedLayout>
  );
}
