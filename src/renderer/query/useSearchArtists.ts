import { useState, type FormEvent } from "react";
import { useDebounce } from "use-debounce";
import useSearch from "./useSearch";
import api from '../api';
import { Artist } from "@/types/types";
import type { SearchArtistsParams } from "@/main/db/artist";

type UseSearchArtists = {
  query: string;
  results: Artist[];
  inputHandlers: {
    onInput: (event: FormEvent) => void;
    onBlur: () => void;
    onFocus: () => void;
  },
};

type UseSearchArtistsParams = Pick<SearchArtistsParams, 'exclude'>;

const DEBOUNCE_MS = 300;

export default function useSearchArtists({ exclude }: UseSearchArtistsParams): UseSearchArtists {
  const [query, setQuery] = useState('');
  const [debouncedQuery] = useDebounce(query, DEBOUNCE_MS, {
    leading: false,
  });

  const { results } = useSearch({
    query: debouncedQuery,
    queryKey: ["artists", "search", debouncedQuery],
    queryFn: (query, take) =>
      api.artist.searchArtists({ query, take, exclude }),
    take: 10,
  });

  return {
    query: debouncedQuery,
    inputHandlers: {
      onInput: (event) => setQuery((event.target as HTMLInputElement).value),
      onBlur: () => api.state.setInputFocused(false),
      onFocus: () => api.state.setInputFocused(true),
    },
    results,
  };
}