import { useRef } from "react";
import { useTranslation } from "react-i18next";
import useStore from "@/renderer/store";
import api from "@/renderer/api";
import { useFocus } from "@/renderer/hooks/useFocus";
import { AnimatedLayout } from "../AnimatedLayout";
import { type StepProps } from "../Onboarding";

import { Icon } from "@/renderer/icons";
import cx from "clsx";
import styles from "../Onboarding.module.css";
import formStyles from "@/renderer/forms.module.css";

export default function DiscogsStep({ onCancel, onNextStep }: StepProps) {
  const secretInputRef = useRef(null);
  const { t } = useTranslation();
  const { ref, focus } = useFocus(true);
  const { settings } = useStore();

  async function onInput(
    field: "DISCOGS_KEY" | "DISCOGS_SECRET",
    value: string
  ) {
    await api.settings.updateSettings({
      ...settings,
      [field]: value,
    });
  }

  return (
    <AnimatedLayout>
      <header className={styles.header}>
        <h1>{t("pages.Onboarding.steps.discogs.title")}</h1>
        <p>{t("pages.Onboarding.steps.discogs.subtitle")}</p>
      </header>
      <div className={styles.group}>
        <a
          href={t("pages.Onboarding.steps.discogs.where.link")}
          target="_blank"
          className={styles.info}
        >
          <Icon isFor="modal.info" />
          {t("pages.Onboarding.steps.discogs.where.text")}
        </a>

        <label
          className={cx(
            formStyles.label,
            formStyles.vertical,
            styles.textInput
          )}
        >
          {t("pages.Onboarding.steps.discogs.apiKey.label")}
          <input
            className={formStyles.input}
            value={settings.DISCOGS_KEY}
            placeholder={t("pages.Onboarding.steps.discogs.apiKey.placeholder")}
            onInput={(event) =>
              onInput("DISCOGS_KEY", (event.target as HTMLInputElement).value)
            }
            onPaste={() =>
              setTimeout(() => secretInputRef.current.focus(), 100)
            }
          />
        </label>
        <label
          className={cx(
            formStyles.label,
            formStyles.vertical,
            styles.textInput
          )}
        >
          {t("pages.Onboarding.steps.discogs.apiSecret.label")}
          <input
            ref={secretInputRef}
            className={formStyles.input}
            value={settings.DISCOGS_SECRET}
            placeholder={t(
              "pages.Onboarding.steps.discogs.apiSecret.placeholder"
            )}
            onInput={(event) =>
              onInput(
                "DISCOGS_SECRET",
                (event.target as HTMLInputElement).value
              )
            }
            onPaste={() => setTimeout(focus, 100)}
          />
        </label>
        <p className={styles.info}>
          {t("pages.Onboarding.steps.discogs.info")}
        </p>
      </div>
      <div className={styles.actions}>
        <button
          className={cx(formStyles.button, formStyles.primary, styles.button)}
          onClick={onNextStep}
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
