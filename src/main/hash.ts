import sha1 from "sha1";
import type { ReleaseWithArtist } from "@/types/types";

export function hashRelease({
  title,
  artist_id,
  year,
  type,
  discNumber,
}: Pick<ReleaseWithArtist, "title" | "artist_id" | "year" | "type"> & {
  discNumber?: number;
}) {
  return sha1([title, artist_id, year, type, discNumber || 1].join("-")).slice(
    0,
    16
  );
}

export function hashArtistName(name: string) {
  return sha1(name).slice(0, 16);
}
