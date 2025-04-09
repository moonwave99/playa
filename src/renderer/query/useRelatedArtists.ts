import { useRef, useState, type FormEvent, type Ref } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDebounce } from "use-debounce";
import useSearch from "./useSearch";
import useArtist from "./useArtist";
import api from '../api';
import { Artist, ArtistWithRelatedArtists } from "@/types/types";

type UseRelatedArtists = {
  query: string;
  results: Artist[];
  artist: ArtistWithRelatedArtists;
  inputRef: Ref<HTMLInputElement>,
  inputHandlers: {
    onInput: (event: FormEvent) => void;
    onBlur: () => void;
    onFocus: () => void;
  },
  addRelatedArtist: (id: number) => void;
  removeRelatedArtist: (id: number) => void;
};

const DEBOUNCE_MS = 300;

export default function useRelatedArtists(id: number): UseRelatedArtists {
  const queryClient = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [debouncedQuery] = useDebounce(query, DEBOUNCE_MS, {
    leading: false,
  });

  const { results } = useSearch({
    query: debouncedQuery,
    queryKey: ["artists", "search", debouncedQuery],
    queryFn: (query, take) =>
      api.artist.searchArtists({ query, take, excludeArtistsRelatedTo: id }),
    take: 10,
  });

  const { artist } = useArtist(id);

  function onSuccess() {
    [
      ["releases", "latest"],
      ["artists", id],
      ["artists", "search", debouncedQuery],
    ].forEach(queryKey => queryClient.invalidateQueries({ queryKey }));
  }

  const addRelatedArtist = useMutation({
    mutationFn: (other_id: number) => api.artist.addRelatedArtist(id, other_id),
    onSuccess
  });

  const removeRelatedArtist = useMutation({
    mutationFn: (other_id: number) => api.artist.removeRelatedArtist(id, other_id),
    onSuccess
  });

  return {
    query: debouncedQuery,
    inputRef,
    inputHandlers: {
      onInput: (event) => setQuery((event.target as HTMLInputElement).value),
      onBlur: () => api.state.setInputFocused(false),
      onFocus: () => api.state.setInputFocused(true),
    },
    addRelatedArtist: addRelatedArtist.mutate,
    removeRelatedArtist: removeRelatedArtist.mutate,
    results,
    artist
  };
}