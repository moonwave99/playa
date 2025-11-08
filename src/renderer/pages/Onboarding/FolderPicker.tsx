import { useTranslation } from "react-i18next";
import { useFocus } from "@/renderer/hooks/useFocus";
import cx from "clsx";
import { Icon } from "@/renderer/icons";
import styles from "./Onboarding.module.css";
import formStyles from "@/renderer/forms.module.css";

type FolderPickerProps = {
  folder: string;
  folderType: string;
  autoFocus?: boolean;
  onClick: () => void;
};

export default function FolderPicker({
  folder,
  folderType,
  onClick,
  autoFocus,
}: FolderPickerProps) {
  const { t } = useTranslation();
  const { ref } = useFocus(autoFocus);

  return (
    <div
      className={cx(styles.folderPicker, { [styles.isFolderSet]: !!folder })}
    >
      {folder && (
        <input
          value={folder}
          type="input"
          tabIndex={-1}
          readOnly
          className={formStyles.input}
          placeholder={t(`pages.Onboarding.folders.${folderType}.placeholder`)}
        />
      )}

      <button
        className={cx(
          formStyles.button,
          formStyles.primary,
          styles.button,
          styles.fileButton
        )}
        type="button"
        ref={ref}
        onClick={onClick}
        aria-label={t(`pages.Onboarding.folders.${folderType}.label`)}
      >
        <Icon isFor="actions.pickFolder" />
        <span>{t(`pages.Onboarding.folders.${folderType}.label`)}</span>
      </button>
    </div>
  );
}
