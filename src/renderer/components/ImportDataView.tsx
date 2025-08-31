import { useState, useEffect } from "react";
import useStore from "../store";
import api from "../api";
import cx from "clsx";
import styles from "./ImportDataView.module.css";
import formStyles from "../forms.module.css";

type ImportDataViewProps = {
  onDone: () => void;
  onCancel: () => void;
};

const ON_DONE_DELAY = 3000;

export default function ImportDataView({
  onDone,
  onCancel,
}: ImportDataViewProps) {
  const [progress, setProgress] = useState<Record<string, boolean>>({});
  const { setModalFixed } = useStore();

  useEffect(() => {
    const unsubscribe = [
      api.importExport.onProgress((step, completed) => {
        setModalFixed(true);
        if (step === "done") {
          setTimeout(onDone, ON_DONE_DELAY);
        }
        setProgress((prev) => ({ ...prev, [step]: completed }));
      }),
      api.importExport.onError((message) => {
        window.alert(message);
        setModalFixed(false);
      }),
    ];

    return () => unsubscribe.forEach((u) => u());
  }, []);

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

  function renderStep(step: string, completed: boolean) {
    if (step === "done") {
      return (
        <span className={styles.step}>
          Import successful! Playa will restart now.
        </span>
      );
    }
    return (
      <>
        <span className={styles.step}>
          {step}
          {!completed ? "..." : ""}
        </span>
        {completed ? <span className={styles.completed}>Done</span> : ""}
      </>
    );
  }

  const inProgress = !!Object.keys(progress).length;

  return (
    <div className={styles.view}>
      <h2 className={styles.title}>Import Data from Archive</h2>
      {!inProgress && (
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
      <ul className={styles.progress}>
        {Object.entries(progress).map(([step, completed]) => (
          <li key={step}>{renderStep(step, completed)}</li>
        ))}
      </ul>
      <div className={formStyles.actions}>
        <button
          type="button"
          className={cx(formStyles.button, formStyles.primary)}
          onClick={onImportClick}
          disabled={inProgress}
        >
          Select File
        </button>
        <button
          type="button"
          className={formStyles.button}
          onClick={onCancel}
          disabled={inProgress}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
