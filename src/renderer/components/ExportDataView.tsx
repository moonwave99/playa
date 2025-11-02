import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useApiEvents } from "../hooks/useApiEvents";
import api from "../api";
import useStore from "../store";
import cx from "clsx";
import styles from "./ExportDataView.module.css";
import formStyles from "../forms.module.css";
import { ON_EXPORT_DONE_DELAY } from "@/constants";

type ExportDataViewProps = {
  closeModal: () => void;
};

export default function ExportDataView({ closeModal }: ExportDataViewProps) {
  const { t } = useTranslation();
  const { status, start } = useExportData(closeModal);

  return (
    <div className={styles.view}>
      <h2>{t("modals.ExportDataView.title")}</h2>
      <p className={styles.description}>
        {status
          ? t(`modals.ExportDataView.status.${status}`)
          : t("modals.ExportDataView.info")}
      </p>
      <div className={formStyles.actions}>
        <button
          type="button"
          className={cx(formStyles.button, formStyles.primary)}
          onClick={start}
          disabled={status === "progress"}
        >
          {t("modals.ExportDataView.actions.selectFolder")}
        </button>
        <button
          type="button"
          className={formStyles.button}
          onClick={closeModal}
          disabled={status === "progress"}
        >
          {t("modals.ExportDataView.actions.close")}
        </button>
      </div>
    </div>
  );
}

function useExportData(onDone: () => void) {
  const [status, setStatus] = useState(null);
  const { setModalFixed } = useStore();

  useApiEvents({
    onExportProgress: (status) => {
      if (status !== "done") {
        setModalFixed(true);
        setStatus("progress");
        return;
      }
      setStatus("done");
      setModalFixed(false);
      setTimeout(onDone, ON_EXPORT_DONE_DELAY);
    },
  });

  return { status, start: () => api.importExport.exportDataFromDialog() };
}
