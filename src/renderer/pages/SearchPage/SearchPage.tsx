import { useTranslation } from "react-i18next";

import cx from "clsx";
import styles from "../Page.module.css";

export default function ArtistPage() {
  const { t } = useTranslation();

  return (
    <div
      className={cx(styles.page, styles.singlePage)}
      data-testid="SearchPage"
    ></div>
  );
}
