import { toDotNotation } from "@/lib/utils";
import { IconBaseProps, IconType } from "react-icons";
import {
  IoChevronDownOutline,
  IoFolderOpenOutline,
  IoMenu,
  IoPlay,
  IoSettingsOutline,
} from "react-icons/io5";
import {
  GoChevronLeft,
  GoChevronRight,
  GoDot,
  GoDotFill,
  GoHomeFill,
} from "react-icons/go";
import { TbBoxMultiple } from "react-icons/tb";
import {
  PiVinylRecord,
  PiUserBold,
  PiUsersBold,
  PiDotsThreeVerticalBold,
} from "react-icons/pi";
import {
  BsGrid,
  BsListOl,
  BsGrid3X2Gap,
  BsAlphabet,
  BsThreeDots,
} from "react-icons/bs";
import { IoMdTime, IoIosClose, IoMdCheckmark } from "react-icons/io";
import { TiDelete } from "react-icons/ti";
import {
  MdEdit,
  MdError,
  MdInfoOutline,
  MdOutlineDriveFolderUpload,
  MdOutlineSearch,
} from "react-icons/md";

import { RiErrorWarningFill } from "react-icons/ri";

const iconMap = toDotNotation({
  pages: {
    home: GoHomeFill,
    artist: PiUserBold,
    artists: PiUserBold,
    release: PiVinylRecord,
    releases: PiVinylRecord,
    collection: TbBoxMultiple,
    collections: TbBoxMultiple,
    group: PiUsersBold,
    groups: PiUsersBold,
    settings: IoSettingsOutline,
    search: MdOutlineSearch,
  },
  listViewModes: {
    grid: BsGrid,
    list: BsListOl,
    compact: BsGrid3X2Gap,
    latest: IoMdTime,
    alphabetical: BsAlphabet,
  },
  modal: {
    close: IoIosClose,
    info: MdInfoOutline,
  },
  actions: {
    delete: TiDelete,
    contextMenu: BsThreeDots,
    search: MdOutlineSearch,
    upload: MdOutlineDriveFolderUpload,
    play: IoPlay,
    pickFolder: IoFolderOpenOutline,
    import: MdOutlineDriveFolderUpload,
    edit: MdEdit,
    toggleMenu: IoMenu,
    drag: PiDotsThreeVerticalBold,
  },
  history: {
    back: GoChevronLeft,
    forward: GoChevronRight,
  },
  lightbox: {
    prev: GoChevronLeft,
    next: GoChevronRight,
  },
  onboarding: {
    step: GoDot,
    currentStep: GoDotFill,
  },
  lookup: {
    open: IoChevronDownOutline,
  },
  common: {
    checked: IoMdCheckmark,
    warning: RiErrorWarningFill,
  },
});

type IconProps = IconBaseProps & {
  isFor: string;
};

export function Icon({ isFor, ...rest }: IconProps) {
  const FoundIcon = iconMap[isFor] as IconType;

  if (!FoundIcon) {
    console.warn("Icon not found:", isFor);
  }

  return FoundIcon ? (
    <FoundIcon {...rest} />
  ) : (
    <MdError title={`Icon not found: ${isFor}`} style={{ color: "red" }} />
  );
}
