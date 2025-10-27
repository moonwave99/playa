import { shell } from "electron";
import { Artist, ReleaseWithArtist } from "@/types/types";
import { normalizeArtistName } from "./utils";
import { getDiscogsURL, getRYMURL, getYoutubeURL } from "./links";

export function searchReleaseOnDiscogs({ artist, title }: ReleaseWithArtist) {
  shell.openExternal(
    getDiscogsURL(`${normalizeArtistName(artist.name)} ${title}`, "master")
  );
}

export function searchArtistOnDiscogs(artist: Artist) {
  shell.openExternal(getDiscogsURL(normalizeArtistName(artist.name), "artist"));
}

export function searchReleaseOnRYM({ artist, title }: ReleaseWithArtist) {
  shell.openExternal(
    getRYMURL(`${normalizeArtistName(artist.name)} ${title}`, "release")
  );
}

export function searchArtistOnRYM(artist: Artist) {
  shell.openExternal(getRYMURL(artist.name, "artist"));
}

export function searchReleaseOnYouTube({ artist, title }: ReleaseWithArtist) {
  shell.openExternal(
    getYoutubeURL(`${normalizeArtistName(artist.name)} ${title}`)
  );
}
