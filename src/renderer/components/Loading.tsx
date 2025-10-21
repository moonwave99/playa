import { useTranslation } from "react-i18next";
import cx from "clsx";
import styles from "./Loading.module.css";
import LoadingIcon from "../../assets/loading.svg?react";

type LoadingProps = {
  className?: string;
  size?: "normal" | "small";
};

export default function Loading({ className, size = "normal" }: LoadingProps) {
  const { t } = useTranslation();
  return (
    <div className={cx(styles.Loading, className)}>
      <LoadingIcon
        className={cx(styles.LoadingIcon, { [styles.small]: size === "small" })}
        aria-label={t("components.Loading.text")}
      />
    </div>
  );
}
