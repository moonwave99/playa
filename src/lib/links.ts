import { normalizeTitle } from "./utils";
import type { HasId, Entities, HasEntityType } from "@/types/types";
import { deburr, mapValues } from "lodash";

export function getURL(url: string, params: Record<string, string>) {
  return `${url}?${new URLSearchParams(mapValues(params, deburr))}`;
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

export function getCover(hash: string): string {
  return `playa-cover://${hash}-cover.jpg`;
}

export function getCollectionLink({ id }: HasId) {
  return getEntityLink({ id, entityType: "Collection" });
}

export function getGroupLink({ id }: HasId) {
  return getEntityLink({ id, entityType: "Group" });
}

export function getArtistLink({ id }: HasId) {
  return getEntityLink({ id, entityType: "Artist" });
}

export function getReleaseLink({ id }: HasId) {
  return getEntityLink({ id, entityType: "Release" });
}

export function getEntityLink({ id, entityType }: HasId & HasEntityType) {
  return `/${entityType.toLowerCase()}s/${id}`;
}

export function getRandomLink(
  stats: Partial<Record<Entities, number>>,
  entity: Entities
): string {
  const count = stats[entity];
  const randomId = Math.round(Math.random() * count);
  return `/${entity}s/${randomId}`;
}
