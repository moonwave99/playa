import { useTranslation } from "react-i18next";
import useImportData from "../hooks/useImportData";
import cx from "clsx";
import styles from "../importData.module.css";
import formStyles from "../forms.module.css";

type ImportFoldersViewProps = {
  closeModal: () => void;
};

export default function ImportFoldersView({
  closeModal,
}: ImportFoldersViewProps) {
  const { t } = useTranslation();
  const { steps, isDone } = useImportData({
    onDone: closeModal,
    closeAfter: 10000,
  });

  return (
    <div className={styles.view}>
      <h2>{t("modals.ImportFoldersView.title")}</h2>
      <ul className={styles.progress}>
        {steps.map(([folder, completed]) => (
          <li key={folder}>
            <span className={styles.step}>
              {folder}
              {!completed ? "..." : ""}
            </span>
            {completed ? (
              <span className={styles.completed}>
                {t("modals.ImportFoldersView.status.done")}
              </span>
            ) : (
              ""
            )}
          </li>
        ))}
      </ul>
      <div className={formStyles.actions}>
        <button
          type="button"
          className={cx(formStyles.button, formStyles.primary)}
          onClick={closeModal}
          disabled={!isDone}
        >
          {t("modals.ImportFoldersView.actions.close")}
        </button>
      </div>
    </div>
  );
}
