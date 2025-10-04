import useImportData from "../hooks/useImportData";
import api from "../api";
import cx from "clsx";
import styles from "../importData.module.css";
import formStyles from "../forms.module.css";

type ImportDataViewProps = {
  onDone: () => void;
  onCancel: () => void;
};

export default function ImportDataView({
  onDone,
  onCancel,
}: ImportDataViewProps) {
  const { isDone, steps, lastStepRef } = useImportData<HTMLLIElement>({
    onDone,
    onCancel,
    closeAfter: 3000,
  });

  async function onImportClick() {
    if (
      !window.confirm(
        "This will overwrite your current data, are you sure to proceed?"
      )
    ) {
      return;
    }
    await api.importExport.importDataFromDialog();
  }

  return (
    <div className={styles.view}>
      <h2>Import Data from Archive</h2>
      {!steps.length && (
        <div className={styles.description}>
          <p>
            Please select an exported archive in the{" "}
            <code>playa-data-XXXXXX.zip</code> format.
          </p>
          <p>
            <span className={styles.warning}>Important</span> - this action is
            not reversible.
            <br />
            Please export an archive of your data first in order to be safe.
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
              {completed ? <span className={styles.completed}>Done</span> : ""}
            </li>
          ))}
        </ul>
      ) : null}
      {isDone && (
        <div className={styles.description}>
          Import successful! Playa will restart now.
        </div>
      )}
      <div className={formStyles.actions}>
        <button
          type="button"
          className={cx(formStyles.button, formStyles.primary)}
          onClick={onImportClick}
          disabled={!!steps.length}
        >
          Select File
        </button>
        <button
          type="button"
          className={formStyles.button}
          onClick={onCancel}
          disabled={!!steps.length && !isDone}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
