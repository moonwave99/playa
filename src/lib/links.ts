import { formatEntityType, normalizeTitle } from "./utils";
import type { HasId, Entities, EntityType, HasEntityType } from "@/types/types";
import { deburr, mapValues } from "lodash";

export function getURL(
  url: string,
  params: Record<string, string | number | boolean>
) {
  if (!Object.keys(params).length) {
    return url;
  }
  return `${url}?${new URLSearchParams(mapValues(params, deburr))}`;
}

export function getYoutubeURL(q: string) {
  return getURL("https://www.youtube.com/results", {
    search_query: normalizeTitle(q),
  });
}

export function getDiscogsURL(q: string, type: "artist" | "master") {
  return getURL("https://www.discogs.com/search", {
    type,
    q: normalizeTitle(q),
  });
}

const RYMMap = {
  artist: "a",
  release: "l",
};

export function getRYMURL(
  searchterm: string,
  type: "artist" | "release" = "release"
) {
  return getURL("https://rateyourmusic.com/search", {
    searchtype: RYMMap[type],
    searchterm: normalizeTitle(searchterm),
  });
}

export function getCover(hash: string, avoidCache = false): string {
  return `playa-cover://${hash}-cover.jpg${avoidCache ? `?${Math.random() * 100000}`.slice(0, 5) : ""}`;
}

export function getEntityLink({
  entityType,
  id,
}: HasEntityType & { id?: number }) {
  return [
    "",
    formatEntityType(entityType, { capital: false, plural: true }),
    id,
  ]
    .filter((x) => typeof x !== "undefined")
    .join("/");
}

export function getCollectionLink({ id }: HasId) {
  return getEntityLink({ id, entityType: "collection" });
}

export function getGroupLink({ id }: HasId) {
  return getEntityLink({ id, entityType: "group" });
}

export function getArtistLink({ id }: HasId) {
  return getEntityLink({ id, entityType: "artist" });
}

export function getReleaseLink({
  id,
  track_id,
}: HasId & { track_id?: number }) {
  const link = getEntityLink({ id, entityType: "release" });
  return track_id ? `${link}?track_id=${track_id}` : link;
}

export function getRandomLink(
  stats: Partial<Record<Entities, number>>,
  entity: Entities
): string {
  const count = stats[entity];
  const randomId = Math.round(Math.random() * count) + 1;
  return getEntityLink({ id: randomId, entityType: entity as EntityType });
}
