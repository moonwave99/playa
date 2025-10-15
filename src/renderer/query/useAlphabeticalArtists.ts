import { useQuery } from "@tanstack/react-query";
import type { Artist } from "@/types/types";
import api from "../api";

type UseAlphabeticalArtists = {
  isPending: boolean;
  error: Error;
  artists: [string, Artist[]][];
};

export default function useAlphabeticalArtists(): UseAlphabeticalArtists {
  const { data, error, isPending } = useQuery({
    queryKey: ["artists", "alphabetical"],
    queryFn: api.artist.getAllArtists,
  });

  return {
    artists: data as [string, Artist[]][],
    isPending,
    error,
  };
}
