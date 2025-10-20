import LookupView from "./LookupView";
import useSearch from "../query/useSearch";
import { useState } from "react";
import { useDebounce } from "use-debounce";
import api from "../api";
import ErrorView from "./ErrorView";
import Loading from "./Loading";
import { SearchableEntities, SearchResult } from "@/types/types";

type LookupEntityViewProps = {
  type: SearchableEntities;
  className?: string;
  filterFn?: (item: SearchResult) => boolean;
  onSelect: (result: SearchResult) => void;
  take?: number;
};

const DEBOUNCE_MS = 300;

export default function LookupReleasesView({
  className,
  filterFn = () => true,
  onSelect,
  take = 10,
  type,
}: LookupEntityViewProps) {
  const [query, setQuery] = useState("");
  const [debouncedQuery] = useDebounce(query, DEBOUNCE_MS, {
    leading: false,
  });

  const { isPending, error, results } = useSearch({
    take,
    query: debouncedQuery,
    queryKey: ["search", debouncedQuery],
    queryFn: (query, take) =>
      api.searchResult.getSearchResults({
        query,
        take,
        type,
      }),
  });

  if (isPending) {
    return <Loading />;
  }

  if (error) {
    return <ErrorView error={error} />;
  }

  return (
    <LookupView
      className={className}
      items={results.filter(filterFn)}
      onChange={onSelect}
      query={query}
      onQueryChange={setQuery}
      getText={(item) => item?.title}
    />
  );
}
