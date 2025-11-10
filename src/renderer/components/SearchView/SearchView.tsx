import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useDebounce } from "use-debounce";
import { DEBOUNCE_INTERVAL } from "@/constants";
import api from "@/renderer/api";
import useSearchInput from "@/renderer/hooks/useSearchInput";
import useSearch from "@/renderer/query/useSearch";
import SearchResultsView from "./SearchResultsView";
import { Icon } from "@/renderer/icons";

import cx from "clsx";
import styles from "./SearchView.module.css";

type SearchViewProps = {
  closeModal: () => void;
};

export default function SearchView({ closeModal }: SearchViewProps) {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const [debouncedQuery] = useDebounce(query, DEBOUNCE_INTERVAL, {
    leading: false,
  });

  const { isPending, error, results } = useSearch({
    take: 100,
    query: debouncedQuery,
    queryKey: ["search", debouncedQuery],
    queryFn: (query, take) =>
      api.searchResult.getSearchResults({
        query,
        take,
      }),
  });

  const groupedResults = Object.groupBy(results, ({ type }) => type);

  const { inputRef, inputHandlers, listHandlers, currentContext, setContext } =
    useSearchInput({ setQuery, resultTypes: Object.keys(groupedResults) });

  return (
    <div className={cx(styles.view)}>
      <div className={styles.searchBar}>
        <label className={styles.searchInputLabel}>
          <Icon
            isFor="actions.search"
            aria-label={t("modals.SearchView.fields.search.label")}
          />
          <input
            autoFocus
            ref={inputRef}
            className={styles.searchInput}
            type="search"
            placeholder={t("modals.SearchView.fields.search.placeholder")}
            {...inputHandlers}
          />
        </label>
      </div>

      <SearchResultsView
        currentContext={currentContext}
        setContext={setContext}
        onLinkClick={closeModal}
        isPending={isPending}
        groupedResults={groupedResults}
        error={error}
        listHandlers={listHandlers}
      />
    </div>
  );
}
