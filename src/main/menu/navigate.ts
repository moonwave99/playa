import type { SupportedIcons } from "@/renderer/icons";

export const navigateMenu: {
  label: string;
  accelerator: string;
  link: string;
  section: SupportedIcons;
}[] = [
  {
    label: "Home",
    accelerator: "Cmd+1",
    link: "/",
    section: "home",
  },
  {
    label: "Releases",
    accelerator: "Cmd+2",
    link: "/releases",
    section: "release",
  },
  {
    label: "Artists",
    accelerator: "Cmd+3",
    link: "/artists",
    section: "artist",
  },
  {
    label: "Collections",
    accelerator: "Cmd+4",
    link: "/collections",
    section: "collection",
  },
  {
    label: "Groups",
    accelerator: "Cmd+5",
    link: "/groups",
    section: "group",
  },
];
