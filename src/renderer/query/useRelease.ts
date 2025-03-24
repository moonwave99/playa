import { useEffect } from 'react';
import { useQuery } from "@tanstack/react-query";
import type { ReleaseWithArtistAndTracksAndSubreleases } from "@/types/types";

type UseRelease = {
  isPending: boolean;
  error: Error;
  release: ReleaseWithArtistAndTracksAndSubreleases;
};

export default function useRelease(id: number): UseRelease {
  const { isPending, error, refetch, data: release } = useQuery({
    queryKey: ["releases", id],
    queryFn: () => window.api.data.getRelease(id),
  });

  useEffect(() => {
    if (!release || hasTracks(release)) {
      return;
    }
    window.api.system.refreshReleaseContents(release.id).then(refetch);
  }, [release]);

  return {
    release,
    isPending,
    error,
  }
}

function hasTracks(release: ReleaseWithArtistAndTracksAndSubreleases) {
  return [
    release.tracks,
    ...release.subReleases.map(
      (x: ReleaseWithArtistAndTracksAndSubreleases) => x.tracks
    ),
  ].every((x) => x.length);
}