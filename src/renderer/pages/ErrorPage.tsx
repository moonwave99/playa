import { useTranslation } from "react-i18next";
import styles from "./Page.module.css";

export default function ErrorPage() {
  const { t } = useTranslation();
  return (
    <div className={styles.errorPage}>
      <h1>{t("pages.ErrorPage.title")}</h1>
      <p>{t("pages.ErrorPage.description")}</p>
    </div>
  );
}
