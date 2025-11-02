import { shell } from "electron";
import { Artist } from "@/types/types";
import { normalizeArtistName } from "./utils";
import { getDiscogsURL, getRYMURL, getYoutubeURL } from "./links";

type SearchParams = {
  title: string;
  artist: {
    name: string;
  };
};

export function searchReleaseOnDiscogs({ artist, title }: SearchParams) {
  shell.openExternal(
    getDiscogsURL(`${normalizeArtistName(artist.name)} ${title}`, "master")
  );
}

export function searchArtistOnDiscogs(artist: Artist) {
  shell.openExternal(getDiscogsURL(normalizeArtistName(artist.name), "artist"));
}

export function searchReleaseOnRYM({ artist, title }: SearchParams) {
  shell.openExternal(
    getRYMURL(`${normalizeArtistName(artist.name)} ${title}`, "release")
  );
}

export function searchArtistOnRYM({ name }: SearchParams["artist"]) {
  shell.openExternal(getRYMURL(name, "artist"));
}

export function searchReleaseOnYouTube({ artist, title }: SearchParams) {
  shell.openExternal(
    getYoutubeURL(`${normalizeArtistName(artist.name)} ${title}`)
  );
}
