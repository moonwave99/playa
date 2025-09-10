import { ToastContentProps } from "react-toastify";
import type { Notification } from "@/types/types";
import styles from "./ToastView.module.css";

type ToastViewProps = ToastContentProps<Notification>;

export default function ToastView({ data }: ToastViewProps) {
  return <div className={styles.view}>{data.message}</div>;
}
