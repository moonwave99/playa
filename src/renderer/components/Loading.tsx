import styles from "./Loading.module.css";
import LoadingIcon from "../../assets/loading.svg?react";

export default function Loading() {
    return (
        <div className={styles.Loading}>
            <LoadingIcon className={styles.LoadingIcon} />
        </div>
    );
}
