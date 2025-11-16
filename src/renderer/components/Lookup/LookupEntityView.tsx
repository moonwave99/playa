import { SearchableEntities, SearchResult } from "@/types/types";
import { DEBOUNCE_INTERVAL, DEFAULT_LOOKUP_PAGE_SIZE } from "@/constants";
import LookupView, { type LookupViewProps } from "./LookupView";
import useSearch from "@/renderer/query/useSearch";
import { useState } from "react";
import { useDebounce } from "use-debounce";
import api from "@/renderer/api";
import ErrorView from "@/renderer/components/ErrorView";

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
  take = DEFAULT_LOOKUP_PAGE_SIZE,
  type,
  ...rest
}: LookupEntityViewProps) {
  const [query, setQuery] = useState("");
  const [debouncedQuery] = useDebounce(query, DEBOUNCE_INTERVAL, {
    leading: false,
  });

  const { error, results } = useSearch({
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
      items={results || []}
      onChange={onSelect}
      query={query}
      onQueryChange={setQuery}
      getText={getText}
      {...rest}
    />
  );
}
