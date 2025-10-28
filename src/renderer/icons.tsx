import { type ReactNode } from "react";
import { ListViewModes } from "@/types/types";

import { IoSettingsOutline } from "react-icons/io5";
import { GoHomeFill } from "react-icons/go";
import { TbBoxMultiple } from "react-icons/tb";
import { PiVinylRecord, PiUserBold, PiUsersBold } from "react-icons/pi";
import { BsGrid, BsListOl, BsGrid3X2Gap, BsAlphabet } from "react-icons/bs";
import { IoMdTime } from "react-icons/io";

export type SupportedIcons =
  | "home"
  | "artist"
  | "artists"
  | "release"
  | "releases"
  | "collection"
  | "collections"
  | "group"
  | "groups"
  | "settings";

const iconMap: { icon: ReactNode; keys: SupportedIcons[] }[] = [
  {
    icon: <GoHomeFill />,
    keys: ["home"],
  },
  {
    icon: <PiUserBold />,
    keys: ["artist", "artists"],
  },
  {
    icon: <PiVinylRecord />,
    keys: ["release", "releases"],
  },
  {
    icon: <TbBoxMultiple />,
    keys: ["collection", "collections"],
  },
  {
    icon: <PiUsersBold />,
    keys: ["group", "groups"],
  },
  {
    icon: <IoSettingsOutline />,
    keys: ["settings"],
  },
];

export const listActionsIconMap: Record<ListViewModes, ReactNode> = {
  grid: <BsGrid />,
  list: <BsListOl />,
  compact: <BsGrid3X2Gap />,
  latest: <IoMdTime />,
  alphabetical: <BsAlphabet />,
};

type IconProps = {
  isFor: SupportedIcons;
};

export function Icon({ isFor }: IconProps) {
  return iconMap.find(({ keys }) => keys.includes(isFor))?.icon;
}
