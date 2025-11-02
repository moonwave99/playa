import { useTranslation } from "react-i18next";
import useStore from "@/renderer/store";
import api from "@/renderer/api";

import { Icon } from "@/renderer/icons";
import cx from "clsx";
import styles from "./HistoryView.module.css";
import buttonStyles from "@/renderer/buttons.module.css";

export default function HistoryView() {
  const { t } = useTranslation();
  const { historyState, useDarkText } = useStore();

  return (
    <div className={styles.view}>
      <button
        className={cx(buttonStyles.button, styles.button, {
          [styles.useDarkText]: useDarkText,
        })}
        disabled={!historyState?.canGoBack}
        aria-label={t("nav.history.actions.goBack")}
        onClick={() => api.state.goBack()}
      >
        <Icon isFor="history.back" />
      </button>
      <button
        className={cx(buttonStyles.button, styles.button, {
          [styles.useDarkText]: useDarkText,
        })}
        disabled={!historyState?.canGoForward}
        aria-label={t("nav.history.actions.goForward")}
        onClick={() => api.state.goForward()}
      >
        <Icon isFor="history.forward" />
      </button>
    </div>
  );
}
