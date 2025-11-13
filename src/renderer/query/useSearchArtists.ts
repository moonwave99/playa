import { useDebounce } from "use-debounce";
import { DEBOUNCE_INTERVAL } from "@/constants";
import useSearch from "./useSearch";
import api from "../api";

type UseSearchArtists = {
  results: Awaited<ReturnType<typeof api.artist.searchArtistsByName>>;
};

type UseSearchArtistsParams = {
  query: string;
};

export default function useSearchArtists({
  query,
}: UseSearchArtistsParams): UseSearchArtists {
  const [debouncedQuery] = useDebounce(query, DEBOUNCE_INTERVAL, {
    leading: false,
  });

  const { results } = useSearch({
    query: debouncedQuery,
    queryKey: ["artists", "search", debouncedQuery],
    queryFn: (query) => api.artist.searchArtistsByName(query),
    take: 10,
  });

  return {
    results,
  };
}
