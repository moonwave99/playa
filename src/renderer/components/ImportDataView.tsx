import useImportData from "../hooks/useImportData";
import api from "../api";
import cx from "clsx";
import styles from "../importData.module.css";
import formStyles from "../forms.module.css";
import { useTranslation, Trans } from "react-i18next";

type ImportDataViewProps = {
  onDone: () => void;
  onCancel: () => void;
};

export default function ImportDataView({
  onDone,
  onCancel,
}: ImportDataViewProps) {
  const { t } = useTranslation();
  const { isDone, steps, lastStepRef } = useImportData<HTMLLIElement>({
    onDone,
    onCancel,
    closeAfter: 3000,
  });

  async function onImportClick() {
    if (
      !(await api.dialog.openConfirmDialog(
        t("modals.ImportDataView.title"),
        t("modals.ImportDataView.confirm")
      ))
    ) {
      return;
    }
    await api.importExport.importDataFromDialog();
  }

  return (
    <div className={styles.view}>
      <h2>{t("modals.ImportDataView.title")}</h2>
      {!steps.length && (
        <div className={styles.description}>
          <p>
            <Trans
              i18nKey="modals.ImportDataView.description.first"
              components={{
                code: <code />,
              }}
            />
          </p>
          <p>
            <span className={styles.warning}>
              {t("modals.ImportDataView.description.important")}
            </span>{" "}
            {t("modals.ImportDataView.description.second")}
            <br />
            {t("modals.ImportDataView.description.third")}
          </p>
        </div>
      )}
      {steps.length ? (
        <ul className={styles.progress}>
          {steps.map(([step, completed], index) => (
            <li
              key={step}
              ref={index === steps.length - 1 ? lastStepRef : null}
            >
              <span className={styles.step}>
                {step}
                {!completed ? "..." : ""}
              </span>
              {completed ? (
                <span className={styles.completed}>
                  {t("modals.ImportDataView.status.done")}
                </span>
              ) : (
                ""
              )}
            </li>
          ))}
        </ul>
      ) : null}
      {isDone && (
        <div className={styles.description}>
          {t("modals.ImportDataView.success")}
        </div>
      )}
      <div className={formStyles.actions}>
        <button
          type="button"
          className={cx(formStyles.button, formStyles.primary)}
          onClick={onImportClick}
          disabled={!!steps.length}
        >
          {t("modals.ImportDataView.actions.selectFile")}
        </button>
        <button
          type="button"
          className={formStyles.button}
          onClick={onCancel}
          disabled={!!steps.length && !isDone}
        >
          {t("modals.ImportDataView.actions.cancel")}
        </button>
      </div>
    </div>
  );
}
