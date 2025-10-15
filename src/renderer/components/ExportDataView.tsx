import { useState, useEffect } from "react";
import { useApiEvents } from "../hooks/useApiEvents";
import useStore from "../store";
import cx from "clsx";
import styles from "./ExportDataView.module.css";
import formStyles from "../forms.module.css";

type ExportDataViewProps = {
  onDone: () => void;
};

export default function ExportDataView({ onDone }: ExportDataViewProps) {
  const isDone = useExportData(onDone);

  return (
    <div className={styles.view}>
      <h2>Exporting Data to Archive</h2>
      <p className={styles.description}>{isDone ? "Done!" : "Exporting..."}</p>
      <div className={formStyles.actions}>
        <button
          type="button"
          className={cx(formStyles.button, formStyles.primary)}
          onClick={onDone}
          disabled={!isDone}
        >
          Close
        </button>
      </div>
    </div>
  );
}

const ON_DONE_DELAY = 3000;

function useExportData(onDone: () => void) {
  const [isDone, setDone] = useState(false);
  const { setModalFixed } = useStore();

  useApiEvents({
    onExportProgress: (status) => {
      if (status !== "done") {
        return;
      }
      setDone(true);
      setModalFixed(false);
      setTimeout(onDone, ON_DONE_DELAY);
    },
  });

  useEffect(() => {
    setModalFixed(true);
  }, []);

  return isDone;
}
