import styles from "./ErrorView.module.css";

type ErrorViewProps = { error: Error };

export default function ErrorView({ error }: ErrorViewProps) {
    console.error(error);
    return <div className={styles.ErrorView}>Something went wrong</div>;
}
