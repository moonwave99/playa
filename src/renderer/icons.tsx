import { IoSettingsOutline } from "react-icons/io5";
import { GoHomeFill } from "react-icons/go";
import { TbBoxMultiple } from "react-icons/tb";
import { PiVinylRecord, PiUserBold, PiUsersBold } from "react-icons/pi";

const iconMap = [
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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const supportedIcons = {
  home: "home",
  artist: "artist",
  artists: "artists",
  release: "release",
  releases: "releases",
  collection: "collection",
  collections: "collections",
  group: "group",
  groups: "groups",
  settings: "settings",
};

export type SupportedIcons = keyof typeof supportedIcons;

type IconProps = {
  isFor: SupportedIcons;
};

export function Icon({ isFor }: IconProps) {
  return iconMap.find(({ keys }) => keys.includes(isFor))?.icon;
}
