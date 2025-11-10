import { useTranslation } from "react-i18next";
import { SearchFilters } from "@/types/types";

import cx from "clsx";
import styles from "./SearchView.module.css";
import formStyles from "@/renderer/forms.module.css";

type AdvancedSearchProps = {
  searchFilters: SearchFilters;
  onChange: <K extends keyof SearchFilters>(
    key: K,
    value: SearchFilters[K]
  ) => void;
  applyFilters: boolean;
  toggleApplyFilters: () => void;
};

export default function AdvancedSearchView({
  searchFilters,
  onChange,
  applyFilters,
  toggleApplyFilters,
}: AdvancedSearchProps) {
  const { t } = useTranslation();

  return (
    <div className={styles.AdvancedSearch}>
      <label
        className={cx(formStyles.label, formStyles.vertical, styles.label)}
      >
        {t("components.AdvancedSearch.fields.artistName.label")}
        <input
          className={cx(formStyles.input, formStyles.mini)}
          name="artistName"
          value={searchFilters.artistName}
          placeholder={t(
            "components.AdvancedSearch.fields.artistName.placeholder"
          )}
          onInput={(event) =>
            onChange("artistName", (event.target as HTMLInputElement).value)
          }
        />
      </label>
      <label
        className={cx(formStyles.label, formStyles.vertical, styles.label)}
      >
        {t("components.AdvancedSearch.fields.releaseTitle.label")}
        <input
          className={cx(formStyles.input, formStyles.mini)}
          name="releaseTitle"
          value={searchFilters.releaseTitle}
          placeholder={t(
            "components.AdvancedSearch.fields.releaseTitle.placeholder"
          )}
          onInput={(event) =>
            onChange("releaseTitle", (event.target as HTMLInputElement).value)
          }
        />
      </label>
      <label
        className={cx(formStyles.label, formStyles.vertical, styles.label)}
      >
        {t("components.AdvancedSearch.fields.decade.label")}
        <select
          className={cx(formStyles.input, formStyles.mini)}
          name="decade"
          value={searchFilters.releaseTitle}
          onChange={(event) =>
            onChange("releaseTitle", (event.target as HTMLSelectElement).value)
          }
        >
          <option selected disabled>
            {t("components.AdvancedSearch.fields.decade.placeholder")}
          </option>
          <option>1960</option>
          <option>1970</option>
          <option>1980</option>
          <option>1990</option>
          <option>2000</option>
          <option>2010</option>
          <option>2020</option>
        </select>
      </label>
      <button
        className={cx(styles.searchButton, styles.applyFiltersButton, {
          [styles.active]: applyFilters,
        })}
        onClick={toggleApplyFilters}
      >
        {t("components.AdvancedSearch.actions.apply")}
      </button>
    </div>
  );
}
