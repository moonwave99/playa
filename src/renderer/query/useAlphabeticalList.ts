import { useQuery } from "@tanstack/react-query";
import api from "../api";
import { Artist, Collection, Group } from "@/types/types";

type Entities = Artist | Collection | Group;

type UseAlphabeticalList<T extends Entities> = {
  isPending: boolean;
  error: Error;
  items: [string, T[]][];
};

const queryFnMap = {
  artist: api.artist.getArtistAlphabeticalList,
  collection: api.collection.getCollectionAlphabeticalList,
  group: api.group.getGroupAlphabeticalList,
};

export default function useAlphabeticalList<T extends Entities>(
  entity: "artist" | "collection" | "group"
): UseAlphabeticalList<T> {
  const { data, error, isPending } = useQuery({
    queryKey: [entity, "alphabetical"],
    queryFn: queryFnMap[entity],
  });

  return {
    items: data as [string, T[]][],
    isPending,
    error,
  };
}
