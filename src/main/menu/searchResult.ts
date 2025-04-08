import type { SearchResult } from "@/types/types";
import { artistMenu } from "./artist";
import { releaseMenu } from "./release";
import { collectionMenu } from "./collection";
import type { Controllers } from "../init";

export const searchResultMenu = (controllers: Controllers) => async (result: SearchResult) => {
  if (result.type === 'artist') {
    const artist = await controllers.artist.getArtist(result.id);
    return artistMenu(controllers)(artist);
  }
  if (result.type === 'release') {
    const release = await controllers.release.getRelease(result.id);
    return releaseMenu(controllers)([release], release.id);
  }
  if (result.type === 'collection') {
    const collection = await controllers.collection.getCollection(result.id);
    return collectionMenu(controllers)(collection);
  }
  return true;
}