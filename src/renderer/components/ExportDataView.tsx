import { useState, useEffect } from "react";
import useStore from "../store";
import api from "../api";
import cx from "clsx";
import styles from "./ExportDataView.module.css";
import formStyles from "../forms.module.css";

type ExportDataViewProps = {
  onDone: () => void;
};

export default function ExportDataView({ onDone }: ExportDataViewProps) {
  const [isDone, setDone] = useState(false);
  const { setModalFixed } = useStore();

  useEffect(() => {
    setModalFixed(true);
    const unsubscribe = api.importExport.onExportData((status) => {
      if (status === "done") {
        setDone(true);
        setModalFixed(false);
      }
    });
    return () => unsubscribe();
  }, []);

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
