import type { SupportedIcons } from "@/renderer/icons";

export const navigateMenu: {
  id: string;
  label: string;
  accelerator: string;
  link: string;
  section: SupportedIcons;
}[] = [
  {
    id: "navigate-home",
    label: "Home",
    accelerator: "Cmd+1",
    link: "/",
    section: "home",
  },
  {
    id: "navigate-releases",
    label: "Releases",
    accelerator: "Cmd+2",
    link: "/releases",
    section: "release",
  },
  {
    id: "navigate-artists",
    label: "Artists",
    accelerator: "Cmd+3",
    link: "/artists",
    section: "artist",
  },
  {
    id: "navigate-collections",
    label: "Collections",
    accelerator: "Cmd+4",
    link: "/collections",
    section: "collection",
  },
  {
    id: "navigate-groups",
    label: "Groups",
    accelerator: "Cmd+5",
    link: "/groups",
    section: "group",
  },
];
