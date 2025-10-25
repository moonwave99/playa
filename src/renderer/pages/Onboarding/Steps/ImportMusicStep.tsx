import { useTranslation } from "react-i18next";
import { useFocus } from "@/renderer/hooks/useFocus";
import useReleases from "@/renderer/query/useReleases";
import { AnimatedLayout } from "../AnimatedLayout";
import { type StepProps } from "../Onboarding";
import api from "@/renderer/api";
import Loading from "@/renderer/components/Loading";
import ErrorView from "@/renderer/components/ErrorView";
import ReleaseView from "@/renderer/components/ReleaseView";

import { MdOutlineDriveFolderUpload } from "react-icons/md";
import cx from "clsx";
import styles from "../Onboarding.module.css";
import formStyles from "../../../forms.module.css";

export default function ImportMusicStep({ onCancel, onNextStep }: StepProps) {
  const { t } = useTranslation();
  const { ref } = useFocus(true);
  const { releases, isPending, error } = useReleases();

  async function selectFolder() {
    api.importFolders.importFolderFromDialog();
  }

  if (isPending) {
    return <Loading />;
  }

  if (error) {
    return <ErrorView error={error} />;
  }

  return (
    <AnimatedLayout>
      <header className={styles.header}>
        <h1>{t("pages.Onboarding.steps.importMusic.title")}</h1>
        <p>{t("pages.Onboarding.steps.importMusic.subtitle")}</p>
      </header>

      {!!releases.length && (
        <ul className={styles.releasesList}>
          {releases.map((release) => (
            <li key={release.id}>
              <ReleaseView onClick={() => {}} release={release} />
            </li>
          ))}
        </ul>
      )}

      {releases.length < 3 && (
        <div className={styles.group}>
          <button
            className={cx(formStyles.button, formStyles.primary, styles.button)}
            type="button"
            onClick={selectFolder}
            ref={ref}
          >
            <MdOutlineDriveFolderUpload />
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
          className={cx(formStyles.button, formStyles.primary, styles.button)}
          onClick={onNextStep}
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
