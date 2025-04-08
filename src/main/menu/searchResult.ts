import type { MenuParams, SearchResult } from "@/types/types";
import { artistMenu } from "./artist";
import { releaseMenu } from "./release";
import { collectionMenu } from "./collection";

export const searchResultMenu = ({ controllers, send }: MenuParams) => async (result: SearchResult) => {
  if (result.type === 'artist') {
    const artist = await controllers.artist.getArtist(result.id);
    return artistMenu({ controllers, send })(artist);
  }
  if (result.type === 'release') {
    const release = await controllers.release.getRelease(result.id);
    return releaseMenu({ controllers, send })([release], release.id);
  }
  if (result.type === 'collection') {
    const collection = await controllers.collection.getCollection(result.id);
    return collectionMenu({ controllers, send })(collection);
  }
  return true;
}