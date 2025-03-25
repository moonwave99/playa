import { useEffect, useRef } from 'react';
import { useQuery } from "@tanstack/react-query";
import type { ReleaseWithArtistAndTracksAndSubreleases } from "@/types/types";

type UseRelease = {
  isPending: boolean;
  error: Error;
  release: ReleaseWithArtistAndTracksAndSubreleases;
};

export default function useRelease(id: number): UseRelease {
  const firstRefresh = useRef(true);
  const { isPending, error, refetch, data: release } = useQuery({
    queryKey: ["releases", id],
    queryFn: () => window.api.data.getRelease(id),
  });

  useEffect(() => {
    if (!firstRefresh.current) {
      return;
    }
    if (!release || hasTracks(release)) {
      return;
    }
    firstRefresh.current = false;
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