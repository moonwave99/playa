export function formatTrackNumber(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

type Album = {
  _id: string;
  tracks: string[];
}

export type NextTrackInfo = {
  albumId: string | null;
  trackId: string | null;
}

export function getNextTrack(currentTrack: string, playlist: Album[]): NextTrackInfo{
  let nextTrack = null;
  let nextAlbum = null;

  const currentAlbumIndex = playlist.findIndex(
    ({ tracks }) => tracks.indexOf(currentTrack) > -1
  );
  if (currentAlbumIndex === -1) {
    return {
      albumId: null,
      trackId: null
    };
  }
  const currentAlbum = playlist[currentAlbumIndex];
  const currentTrackIndex = currentAlbum.tracks.findIndex(x => x === currentTrack);
  nextTrack = currentAlbum.tracks[currentTrackIndex + 1];

  if (!nextTrack) {
    nextAlbum = playlist[currentAlbumIndex + 1];
    if (!nextAlbum) {
      return {
        albumId: null,
        trackId: null
      };
    }
    return {
      albumId: nextAlbum._id,
      trackId: nextAlbum.tracks[0]
    }
  }
  return {
    albumId: currentAlbum._id,
    trackId: nextTrack
  };
}

export function getPrevTrack(currentTrack: string, playlist: Album[]): NextTrackInfo{
  let prevTrack = null;
  let prevAlbum = null;

  const currentAlbumIndex = playlist.findIndex(
    ({ tracks }) => tracks.indexOf(currentTrack) > -1
  );
  if (currentAlbumIndex === -1) {
    return {
      albumId: null,
      trackId: null
    };
  }
  const currentAlbum = playlist[currentAlbumIndex];
  const currentTrackIndex = currentAlbum.tracks.findIndex(x => x === currentTrack);
  prevTrack = currentAlbum.tracks[currentTrackIndex - 1];

  if (!prevTrack) {
    prevAlbum = playlist[currentAlbumIndex - 1];
    if (!prevAlbum) {
      return {
        albumId: null,
        trackId: null
      };
    }
    return {
      albumId: prevAlbum._id,
      trackId: prevAlbum.tracks[prevAlbum.tracks.length - 1]
    };
  }
  return {
    albumId: currentAlbum._id,
    trackId: prevTrack
  };
}
