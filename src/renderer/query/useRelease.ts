import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { useQuery } from "@tanstack/react-query";
import api from '../api';
import type {
  ReleaseWithArtistAndTracksAndSubreleases, ReleaseWithArtistAndTracksAndSubreleasesAndCollections
} from "@/types/types";

type UseReleaseParams = {
  id: number;
  refreshOnLoad?: boolean;
  selectOnLoad?: boolean;
};

type UseRelease = {
  isPending: boolean;
  error: Error;
  release: ReleaseWithArtistAndTracksAndSubreleasesAndCollections;
  selectedTrackId: number;
  gotoArtistPage: () => void;
};

export default function useRelease({
  id,
  refreshOnLoad,
  selectOnLoad
}: UseReleaseParams): UseRelease {
  const navigate = useNavigate();
  const firstRefresh = useRef(true);
  const [params] = useSearchParams();

  const { isPending, error, refetch, data: release } = useQuery({
    queryKey: ["releases", id],
    queryFn: () => api.release.getRelease(id),
  });

  useEffect(() => {
    if (!selectOnLoad) {
      return;
    }
    api.state.selectReleases([release]);
  }, [release, selectOnLoad])

  useEffect(() => {
    if (!refreshOnLoad || !firstRefresh.current || !release || hasTracks(release)) {
      return;
    }
    firstRefresh.current = false;
    api.release.refreshReleaseContents(release.id).then(() => refetch());
  }, [release, refreshOnLoad]);

  function gotoArtistPage() {
    navigate(`/artists/${release.artist.id}`);
  }

  return {
    release,
    isPending,
    error,
    selectedTrackId: +params.get('track_id'),
    gotoArtistPage
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