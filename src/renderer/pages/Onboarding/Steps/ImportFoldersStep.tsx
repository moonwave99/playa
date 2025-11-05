import { useEffect } from "react";
import { useTranslation } from "react-i18next";

import { MAX_ONBOARDING_IMPORT_RELEASE_COUNT } from "@/constants";
import useReleases from "@/renderer/query/useReleases";
import { useFocus } from "@/renderer/hooks/useFocus";
import { AnimatedLayout } from "../AnimatedLayout";
import { type StepProps } from "../Onboarding";
import api from "@/renderer/api";
import Loading from "@/renderer/components/Loading";
import ErrorView from "@/renderer/components/ErrorView";
import ReleaseView from "@/renderer/components/ReleaseView";

import { Icon } from "@/renderer/icons";
import cx from "clsx";
import styles from "../Onboarding.module.css";
import formStyles from "../../../forms.module.css";

export default function ImportFoldersStep({ onNextStep }: StepProps) {
  const { t } = useTranslation();
  const { releases, isPending, error } = useReleases();
  const { ref, focus } = useFocus();

  useEffect(() => {
    if (releases.length < MAX_ONBOARDING_IMPORT_RELEASE_COUNT) {
      return;
    }
    focus();
  }, [releases.length]);

  if (isPending) {
    return <Loading />;
  }

  if (error) {
    return <ErrorView error={error} />;
  }

  return (
    <AnimatedLayout>
      <header className={styles.header}>
        <h1>{t("pages.Onboarding.steps.importFolders.title")}</h1>
        <p>{t("pages.Onboarding.steps.importFolders.subtitle")}</p>
      </header>

      {!!releases.length && (
        <ul className={styles.releasesList} data-testid="ReleaseList">
          {releases.map((release) => (
            <li key={release.id}>
              <ReleaseView onClick={() => {}} release={release} />
            </li>
          ))}
        </ul>
      )}

      {releases.length < MAX_ONBOARDING_IMPORT_RELEASE_COUNT && (
        <div className={styles.group}>
          <button
            className={cx(formStyles.button, formStyles.primary, styles.button)}
            type="button"
            onClick={() => api.importFolders.openImportDialog()}
            autoFocus
          >
            <Icon isFor="actions.upload" />
            <span>
              {t(
                `pages.Onboarding.actions.${!releases.length ? "import" : "importAnother"}`
              )}
            </span>
          </button>
        </div>
      )}

      <div className={styles.actions}>
        <button
          ref={ref}
          className={cx(formStyles.button, formStyles.primary, styles.button)}
          onClick={onNextStep}
        >
          {t("pages.Onboarding.actions.finish")}
        </button>
      </div>
    </AnimatedLayout>
  );
}
