import { useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router';
import { useQuery } from "@tanstack/react-query";
import api from '../api';
import type { ReleaseWithArtistAndTracksAndSubreleases } from "@/types/types";

type UseRelease = {
  isPending: boolean;
  error: Error;
  release: ReleaseWithArtistAndTracksAndSubreleases;
  selectedTrackId: number;
};

export default function useRelease(id: number): UseRelease {
  const firstRefresh = useRef(true);
  const [params] = useSearchParams();

  const { isPending, error, refetch, data: release } = useQuery({
    queryKey: ["releases", id],
    queryFn: () => api.release.getRelease(id),
  });

  useEffect(() => {
    api.state.selectReleases([release]);
    if (!firstRefresh.current || !release || hasTracks(release)) {
      return;
    }
    firstRefresh.current = false;
    api.release.refreshReleaseContents(release.id).then(() => refetch());
  }, [release]);

  return {
    release,
    isPending,
    error,
    selectedTrackId: +params.get('track_id')
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