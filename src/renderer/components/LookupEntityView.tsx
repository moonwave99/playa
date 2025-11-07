import { SearchableEntities, SearchResult } from "@/types/types";
import { DEBOUNCE_INTERVAL } from "@/constants";
import LookupView, { type LookupViewProps } from "./LookupView";
import useSearch from "../query/useSearch";
import { useState } from "react";
import { useDebounce } from "use-debounce";
import api from "../api";
import ErrorView from "./ErrorView";

export type LookupEntityViewProps = Pick<
  LookupViewProps<SearchResult>,
  | "allowCustomValue"
  | "placeholderText"
  | "className"
  | "isEntityIncluded"
  | "renderInfo"
> & {
  type: SearchableEntities;
  take?: number;
  onSelect: (result: SearchResult) => void;
};

export default function LookupEntityView({
  onSelect,
  take = 10,
  type,
  ...rest
}: LookupEntityViewProps) {
  const [query, setQuery] = useState("");
  const [debouncedQuery] = useDebounce(query, DEBOUNCE_INTERVAL, {
    leading: false,
  });

  const { isFetching, error, results } = useSearch({
    take,
    query: debouncedQuery,
    queryKey: ["search", debouncedQuery],
    queryFn: (query, take) =>
      api.searchResult.getSearchResults({
        query,
        take,
        type,
        options: type === "release" ? { searchInArtists: true } : {},
      }),
  });

  if (error) {
    return <ErrorView error={error} />;
  }

  function getCustomValue(title: string) {
    return {
      id: null as number,
      title,
    };
  }

  function getText(item: SearchResult) {
    if (!item) {
      return null;
    }
    if (item.type === "release") {
      return `${item.artist} - ${item.title}`;
    }
    return item.title;
  }

  return (
    <LookupView
      getCustomValue={getCustomValue}
      isFetching={isFetching}
      items={results}
      onChange={onSelect}
      query={query}
      onQueryChange={setQuery}
      getText={getText}
      {...rest}
    />
  );
}
