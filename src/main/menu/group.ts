import type { GroupWithArtists, MenuParams } from "@/types/types";
import { buildMenu, getDeleteEntry } from "./menu";

export const groupMenu = ({ controllers }: MenuParams) => (group: GroupWithArtists) => {
  buildMenu([
    getDeleteEntry({
      title: group.title,
      deleteFn: () => controllers.group.deleteGroup(group.id),
      queryKeys: [['groups'], ['groups', group.id]]
    }),
    { type: 'separator' },
  ]);
  return true;
}