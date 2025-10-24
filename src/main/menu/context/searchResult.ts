import type {
  CollectionWithReleases,
  MenuParams,
  SearchResult,
  TrackWithRelease,
} from "@/types/types";
import { artistMenu } from "./artist";
import { releaseMenu } from "./release";
import { collectionMenu } from "./collection";
import { trackMenu } from "./track";

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
    if (result.type === "track") {
      const track = (await controllers.track.getTrackById(
        result.id
      )) as TrackWithRelease;
      return trackMenu(params)(track);
    }
    return true;
  };
