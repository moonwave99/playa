import cx from "clsx";
import styles from "./SearchView.module.css";
import formStyles from "../forms.module.css";

type SearchViewProps = {
  onClose: () => void;
};

export default function SearchView({ onClose }: SearchViewProps) {
  return (
    <div className={styles.view}>
      <h2>
        Search{" "}
        <button
          className={cx(formStyles.button, formStyles.primary)}
          onClick={onClose}
          aria-label="Close Search Modal"
        >
          Close
        </button>
      </h2>
    </div>
  );
}
