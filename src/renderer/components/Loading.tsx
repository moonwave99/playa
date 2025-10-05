import cx from "clsx";
import styles from "./Loading.module.css";
import LoadingIcon from "../../assets/loading.svg?react";

type LoadingProps = {
  className?: string;
};

export default function Loading({ className }: LoadingProps) {
  return (
    <div className={cx(styles.Loading, className)}>
      <LoadingIcon className={styles.LoadingIcon} aria-label="Loading..." />
    </div>
  );
}
