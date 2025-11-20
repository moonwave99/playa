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
import SearchTypeView, { type SearchType } from "./SearchTypeView";
import { useApiEvents } from "@/renderer/hooks/useApiEvents";

export default function SearchPage() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("query"));
  const [debouncedQuery] = useDebounce(query, DEBOUNCE_INTERVAL, {
    leading: false,
  });
  const { searchType, setSearchType } = useSearchType();

  const { results, ...useSearchRest } = useSearch({
    take: 100,
    query: debouncedQuery,
    queryKey: ["search", searchType, debouncedQuery],
    queryFn: (query, take) =>
      query
        ? api.searchResult.getSearchResults({
            query: query.trim(),
            take,
            type: searchType === "all" ? null : searchType,
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
      <SearchTypeView selectedType={searchType} onSelect={setSearchType} />
      <div className={styles.searchBar}>
        <label className={styles.searchInputLabel}>
          <Icon
            isFor="actions.search"
            aria-label={t("pages.SearchPage.fields.search.label")}
          />
          <input
            autoFocus
            ref={inputRef}
            className={styles.searchInput}
            type="search"
            placeholder={t("pages.SearchPage.fields.search.placeholder")}
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

function useSearchType() {
  const [searchType, setSearchType] = useState<SearchType>("all");

  useApiEvents({
    onSetSearchType: setSearchType,
  });

  return {
    searchType,
    setSearchType,
  };
}
