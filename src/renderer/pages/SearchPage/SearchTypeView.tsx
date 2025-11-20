import { useTranslation } from "react-i18next";
import { SearchableEntities, searchableEntities } from "@/types/types";
import cx from "clsx";
import styles from "./SearchPage.module.css";

export type SearchType = SearchableEntities | "all";

export const searchTypes: SearchType[] = [
  "all",
  ...searchableEntities,
] as const;

type SearchTypeViewProps = {
  selectedType: SearchType;
  onSelect: (type: SearchType) => void;
};

export default function SearchTypeView({
  selectedType,
  onSelect,
}: SearchTypeViewProps) {
  const { t } = useTranslation();
  return (
    <ul className={styles.SearchTypeView}>
      {searchTypes.map((type) => (
        <li
          key={type}
          className={cx({
            [styles.selected]: type === selectedType,
          })}
          onClick={() => onSelect(type)}
        >
          {t(
            type === "all"
              ? "pages.SearchPage.types.all"
              : `common.entities.${type}`
          )}
        </li>
      ))}
    </ul>
  );
}
