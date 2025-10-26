import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useApiEvents } from "../hooks/useApiEvents";
import useStore from "../store";
import cx from "clsx";
import styles from "./ExportDataView.module.css";
import formStyles from "../forms.module.css";
import { ON_EXPORT_DONE_DELAY } from "@/constants";

type ExportDataViewProps = {
  onDone: () => void;
};

export default function ExportDataView({ onDone }: ExportDataViewProps) {
  const { t } = useTranslation();
  const isDone = useExportData(onDone);

  return (
    <div className={styles.view}>
      <h2>{t("modals.ExportDataView.title")}</h2>
      <p className={styles.description}>
        {isDone
          ? t("modals.ExportDataView.status.done")
          : t("modals.ExportDataView.status.exporting")}
      </p>
      <div className={formStyles.actions}>
        <button
          type="button"
          className={cx(formStyles.button, formStyles.primary)}
          onClick={onDone}
          disabled={!isDone}
        >
          {t("modals.ExportDataView.actions.close")}
        </button>
      </div>
    </div>
  );
}

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
      setTimeout(onDone, ON_EXPORT_DONE_DELAY);
    },
  });

  useEffect(() => {
    setModalFixed(true);
  }, []);

  return isDone;
}
