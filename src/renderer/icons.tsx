import { IoSettingsOutline } from "react-icons/io5";
import { GoHomeFill } from "react-icons/go";
import { TbBoxMultiple } from "react-icons/tb";
import { PiVinylRecord, PiUserBold, PiUsersBold } from "react-icons/pi";

const iconMap = {
  home: <GoHomeFill />,
  release: <PiVinylRecord />,
  artist: <PiUserBold />,
  collection: <TbBoxMultiple />,
  group: <PiUsersBold />,
  settings: <IoSettingsOutline />,
};

export type SupportedIcons = keyof typeof iconMap;

type IconProps = {
  isFor: SupportedIcons;
};

export function Icon({ isFor }: IconProps) {
  return iconMap[isFor];
}
