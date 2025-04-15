import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from '../api';
import type {
  HasId,
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
  removeFromCollection: (collection_id: number) => void;
  addAdditionalArtist: (artist_id: number) => void;
  removeAdditionalArtist: (artist_id: number) => void;
};

export default function useRelease({
  id,
  refreshOnLoad,
  selectOnLoad
}: UseReleaseParams): UseRelease {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
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

  function onSuccess() {
    [
      ["releases", id],
      ["artists", release.artist.id],
      ...release.collections.map((x: HasId) => ['collections', x.id]),
    ].forEach(queryKey => queryClient.invalidateQueries({ queryKey }));

    queryClient.invalidateQueries({
      predicate: ({ queryKey }) => queryKey.join(':').startsWith('artists:search')
    });
  }

  const removeFromCollection = useMutation({
    mutationFn: (collection_id: number) => api.collection.removeReleasesFromCollection(collection_id, [id]),
    onSuccess
  });

  const addAdditionalArtist = useMutation({
    mutationFn: (artist_id: number) => api.release.addAdditionalArtist(id, artist_id),
    onSuccess
  });

  const removeAdditionalArtist = useMutation({
    mutationFn: (artist_id: number) => api.release.removeAdditionalArtist(id, artist_id),
    onSuccess
  });

  return {
    release,
    isPending,
    error,
    selectedTrackId: +params.get('track_id'),
    gotoArtistPage,
    removeFromCollection: removeFromCollection.mutate,
    addAdditionalArtist: addAdditionalArtist.mutate,
    removeAdditionalArtist: removeAdditionalArtist.mutate,
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