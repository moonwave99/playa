import type {
  CollectionWithReleases,
  MenuParams,
  SearchResult,
} from "@/types/types";
import { artistMenu } from "./artist";
import { releaseMenu } from "./release";
import { collectionMenu } from "./collection";

export const searchResultMenu =
  (params: MenuParams) => async (result: SearchResult) => {
    const controllers = params.controllers;
    if (result.type === "artist") {
      const artist = await controllers.artist.getArtist(result.id);
      return artistMenu(params)(artist);
    }
    if (result.type === "release") {
      const release = await controllers.release.getRelease(result.id);
      return releaseMenu(params)([release]);
    }
    if (result.type === "collection") {
      const collection = (await controllers.collection.getCollection(
        result.id
      )) as CollectionWithReleases;
      return collectionMenu(params)(collection);
    }
    return true;
  };
