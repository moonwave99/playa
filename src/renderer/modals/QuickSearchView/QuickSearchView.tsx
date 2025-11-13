import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { useDebounce } from "use-debounce";
import { DEBOUNCE_INTERVAL } from "@/constants";
import api from "@/renderer/api";
import useSearchInput from "@/renderer/hooks/useSearchInput";
import useSearch from "@/renderer/query/useSearch";
import QuickSearchResults from "./QuickSearchResultsView";
import { Icon } from "@/renderer/icons";

import cx from "clsx";
import styles from "./QuickSearchView.module.css";
import formStyles from "@/renderer/forms.module.css";

type QuickSearchViewProps = {
  closeModal: () => void;
};

export default function QuickSearchView({ closeModal }: QuickSearchViewProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isFormEnabled, setFormEnabled] = useState(false);
  const [query, setQuery] = useState("");
  const [debouncedQuery] = useDebounce(query, DEBOUNCE_INTERVAL, {
    leading: false,
  });

  const searchResults = useSearch({
    take: 5,
    query: debouncedQuery,
    queryKey: ["search", debouncedQuery],
    queryFn: (query, take) =>
      api.quickSearch.getResults({
        query,
        take,
      }),
  });

  const { inputRef, inputHandlers, ...useSearchInputRest } = useSearchInput({
    setQuery,
    resultTypes: ["searchResult"],
    onUp: () => {
      setFormEnabled(true);
    },
  });

  const searchUrl = `/search?${new URLSearchParams({ query })}`;

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    closeModal();
    if (!searchResults.results.length) {
      return;
    }
    navigate(searchUrl);
  }

  function onSelectionChange(selection: number[]) {
    setFormEnabled(!selection.length);
  }

  return (
    <div
      className={cx(styles.view, {
        [styles.showResults]: searchResults.results.length,
      })}
    >
      <form className={styles.searchBar} onSubmit={onSubmit}>
        <label className={styles.searchInputLabel}>
          <Icon
            isFor="actions.search"
            aria-label={t("modals.QuickSearchView.fields.search.label")}
          />
        </label>
        <div className={styles.inputWrapper}>
          <input
            autoFocus
            ref={inputRef}
            className={styles.searchInput}
            type="search"
            placeholder={t("modals.QuickSearchView.fields.search.placeholder")}
            {...inputHandlers}
          />
          {searchResults.results.length ? (
            <button
              className={cx(
                formStyles.button,
                formStyles.primary,
                styles.submitButton
              )}
              disabled={!isFormEnabled}
            >
              {t("modals.QuickSearchView.actions.submit")}
            </button>
          ) : null}
        </div>
      </form>
      <QuickSearchResults
        onLinkClick={closeModal}
        onSelectionChange={onSelectionChange}
        {...searchResults}
        {...useSearchInputRest}
      />
    </div>
  );
}
