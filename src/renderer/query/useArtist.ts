import { useQuery } from "@tanstack/react-query";
import type { ArtistWithReleasesFull } from "@/types/types";

type UseArtist = {
  isPending: boolean;
  error: Error;
  artist: ArtistWithReleasesFull;
};

export default function useArtist(id: number): UseArtist {
  const { isPending, error, data: artist } = useQuery({
    queryKey: ["artists", id],
    queryFn: () => window.api.data.getArtist(id),
  });

  return {
    artist,
    isPending,
    error,
  }
}