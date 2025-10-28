import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import api from "@/renderer/api";
import useStore from "@/renderer/store";
import useClickOutside from "@/renderer/hooks/useClickOutside";
import { useKeyManager } from "@/renderer/hooks/useKeyboardManager";
import useOnLocationChange from "@/renderer/hooks/useOnLocationChange";
import { type SupportedIcons } from "@/renderer/icons";
import { type Modals } from "@/renderer/Modal";
import { capitalize } from "lodash";

const navMap: {
  type: "link" | "modal";
  label: string;
  link: string;
  accelerator: string;
  section: SupportedIcons;
}[] = [
  {
    type: "link",
    label: "Home",
    accelerator: "Cmd+1",
    link: "/",
    section: "home",
  },
  ...["release", "artist", "collection", "group"].map((section, index) => ({
    type: "link" as const,
    accelerator: `Cmd+${index + 2}`,
    link: `/${section}s`,
    section: section as SupportedIcons,
    label: `${capitalize(section)}s`,
  })),
  {
    type: "modal",
    link: "settings",
    label: "Settings",
    accelerator: "Cmd+,",
    section: "settings",
  },
];

export type UseNav = ReturnType<typeof useNav>;

export default function useNav() {
  const navigate = useNavigate();
  const [isNavOpen, setNavOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const ref = useClickOutside(() => setNavOpen(false));
  const { setModalContents, useDarkText } = useStore();

  const { setContext } = useKeyManager({
    context: "nav",
    handlers: {
      Escape: () => setNavOpen(false),
      ArrowDown: () =>
        setCurrentIndex((prev) => Math.min(prev + 1, navMap.length - 1)),
      ArrowUp: () => setCurrentIndex((prev) => Math.max(0, prev - 1)),
      Enter: () => navigate(navMap[currentIndex].link),
    },
  });

  useEffect(() => {
    setContext(isNavOpen ? "nav" : "list");
    setCurrentIndex(isNavOpen ? 0 : -1);
    api.state.setNavOpen(isNavOpen);
  }, [isNavOpen]);

  useEffect(() => {
    const target = ref.current.querySelector(`[data-nav-id="${currentIndex}"]`);
    target?.focus();
  }, [currentIndex]);

  useOnLocationChange(() => setNavOpen(false));

  function openModal(name: Modals) {
    setModalContents({ name });
    setNavOpen(false);
  }

  return {
    navMap,
    ref,
    useDarkText,
    isNavOpen,
    openModal,
    currentIndex,
    setCurrentIndex,
    toggleNav: (toggle?: boolean) =>
      setNavOpen((prev) => (typeof toggle !== "undefined" ? toggle : !prev)),
  };
}
