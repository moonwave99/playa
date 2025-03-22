import type { SearchResult } from "@/types/types";
import { getArtist } from "../db/artist";
import { getRelease } from "../db/release";
import { getCollection } from "../db/collection";

import { artistMenu } from "./artist";
import { releaseMenu } from "./release";
import { collectionMenu } from "./collection";

export const searchResultMenu = async (result: SearchResult) => {
  if (result.type === 'artist') {
    const artist = await getArtist(result.id);
    return artistMenu(artist);
  }
  if (result.type === 'release') {
    const release = await getRelease(result.id);
    return releaseMenu([release], release.id);
  }
  if (result.type === 'collection') {
    const collection = await getCollection(result.id);
    return collectionMenu(collection);
  }
  return true;
}