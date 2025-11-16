import { useState } from "react";
import { useDebounce } from "use-debounce";
import { useSearchParams } from "react-router";
import { useTranslation } from "react-i18next";
import { DEBOUNCE_INTERVAL } from "@/constants";
import api from "@/renderer/api";
import useSearchInput from "@/renderer/hooks/useSearchInput";
import useSearch from "@/renderer/query/useSearch";

import { Icon } from "@/renderer/icons";
import cx from "clsx";
import styles from "./SearchPage.module.css";
import pageStyles from "../Page.module.css";
import SearchResultsView from "./SearchResultsView";

export default function ArtistPage() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("query"));
  const [debouncedQuery] = useDebounce(query, DEBOUNCE_INTERVAL, {
    leading: false,
  });

  const { results, ...useSearchRest } = useSearch({
    take: 100,
    query: debouncedQuery,
    queryKey: ["search", debouncedQuery],
    queryFn: (query, take) =>
      query
        ? api.quickSearch.getResults({
            query: query.trim(),
            take,
          })
        : null,
  });

  const groupedResults = Object.groupBy(results || [], ({ type }) => type);

  const { inputRef, inputHandlers, ...useSearchInputRest } = useSearchInput({
    setQuery,
    resultTypes: Object.keys(groupedResults),
    onInputChange: (query: string) => setSearchParams({ query }),
    baseContext: "list",
    shouldFocusInput: false,
  });

  return (
    <div
      className={cx(pageStyles.singlePage, styles.view)}
      data-testid="SearchPage"
    >
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
        {...useSearchRest}
        {...useSearchInputRest}
        groupedResults={groupedResults}
        baseContext="list"
      />
    </div>
  );
}
