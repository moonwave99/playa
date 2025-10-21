import { useTranslation } from "react-i18next";
import styles from "./ErrorView.module.css";

type ErrorViewProps = { error: Error };

export default function ErrorView({ error }: ErrorViewProps) {
  const { t } = useTranslation();
  console.error(error);
  return (
    <div className={styles.ErrorView}>{t("components.ErrorView.message")}</div>
  );
}
