import { useState, useEffect } from "react";
import type { MouseEvent, ReactNode } from "react";
import { NavLink, Routes, Route } from "react-router";
import { navigateMenu } from "@/main/menu/navigate";
import { ReleaseListViewMode } from "@/types/types";
import { useKeyManager } from "../hooks/useKeyboardManager";
import useClickOutside from "../hooks/useClickOutside";
import useOnLocationChange from "../hooks/useOnLocationChange";
import useStore from "../store";
import api from "../api";
import Breadcrumbs from "./Breadcrumbs";
import { IoMenu } from "react-icons/io5";
import { MdOutlineSearch, MdOutlineDriveFolderUpload } from "react-icons/md";
import { IoMdTime } from "react-icons/io";
import { BsGrid, BsGrid3X2Gap, BsListOl, BsAlphabet } from "react-icons/bs";

import { Icon, type SupportedIcons } from "../icons";
import cx from "clsx";
import styles from "./Nav.module.css";
import buttonStyles from "../buttons.module.css";

const navMap: {
  type: "link" | "modal";
  label: string;
  link: string;
  accelerator: string;
  section: SupportedIcons;
}[] = [
  ...navigateMenu.map((x) => ({ ...x, type: "link" as const })),
  {
    type: "modal",
    link: "settings",
    label: "Settings",
    accelerator: "Cmd+,",
    section: "settings",
  },
];

type NavProps = {
  isDetailPage: boolean;
};

export default function Nav({ isDetailPage }: NavProps) {
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
    },
  });

  useEffect(() => {
    setContext(isNavOpen ? "nav" : "list");
    setCurrentIndex(isNavOpen ? 0 : -1);
  }, [isNavOpen]);

  useEffect(() => {
    const target = ref.current.querySelector(`[data-nav-id="${currentIndex}"]`);
    target?.focus();
  }, [currentIndex]);

  useOnLocationChange(() => setNavOpen(false));

  return (
    <nav
      className={cx(styles.nav, {
        [styles.isOpen]: isNavOpen,
        [styles.isDetailPage]: isDetailPage,
      })}
      ref={ref}
    >
      <Breadcrumbs isDetailPage={isDetailPage} useDarkText={useDarkText} />
      <div className={styles.buttons}>
        <Routes>
          <Route path="/" element={<ImportActions />} />
          <Route path="/releases" element={<ImportActions />} />
          <Route path="/artists" element={<ArtistListActions />} />
          <Route
            path="/artists/:id"
            element={
              <>
                <ReleaseListActions />
                <ImportActions />
              </>
            }
          />
          <Route path="/collections/:id" element={<ReleaseListActions />} />
          <Route path="*" element={null} />
        </Routes>
        <button
          type="button"
          aria-label="Toggle Navigation"
          title="Toggle Navigation"
          onClick={() => setNavOpen((prev) => !prev)}
          className={cx(buttonStyles.button, {
            [buttonStyles.useDarkText]: useDarkText,
          })}
          style={{ marginLeft: "1.5rem" }}
        >
          <IoMenu />
        </button>
        <button
          type="button"
          aria-label="Toggle Search"
          title="Toggle Search"
          onClick={() => setModalContents({ name: "search" })}
          className={cx(buttonStyles.button, {
            [buttonStyles.useDarkText]: useDarkText,
          })}
        >
          <MdOutlineSearch />
        </button>
      </div>
      <div className={styles.entries} ref={ref}>
        {navMap.map(({ link, label, type, accelerator, section }, index) =>
          type === "link" ? (
            <NavLink
              data-nav-id={index}
              key={link}
              to={link}
              className={cx(styles.link, {
                [styles.hasFocus]: index === currentIndex,
              })}
              onClick={(event: MouseEvent) => {
                if (event.metaKey) {
                  event.preventDefault();
                }
                setNavOpen(false);
              }}
            >
              <Icon isFor={section} />
              {label}
              <span className={styles.accelerator}>{accelerator}</span>
            </NavLink>
          ) : (
            <button
              data-nav-id={index}
              key={link}
              className={cx(styles.link, {
                [styles.hasFocus]: index === currentIndex,
              })}
              onClick={() => {
                setModalContents({ name: link });
                setNavOpen(false);
              }}
            >
              <Icon isFor={section} />
              {label}
              <span className={styles.accelerator}>{accelerator}</span>
            </button>
          )
        )}
      </div>
    </nav>
  );
}

function ImportActions() {
  const { useDarkText } = useStore();
  return (
    <button
      type="button"
      aria-label="Import Releases"
      title="Import Releases"
      onClick={() => api.release.importFolderFromDialog()}
      className={cx(buttonStyles.button, {
        [buttonStyles.useDarkText]: useDarkText,
      })}
    >
      <MdOutlineDriveFolderUpload />
    </button>
  );
}

const releaseListActions: {
  viewMode: ReleaseListViewMode;
  ariaLabel: string;
  icon: ReactNode;
}[] = [
  {
    viewMode: "grid",
    ariaLabel: "Show Grid View",
    icon: <BsGrid />,
  },
  {
    viewMode: "list",
    ariaLabel: "Show List View",
    icon: <BsListOl />,
  },
  {
    viewMode: "compact",
    ariaLabel: "Show Compact View",
    icon: <BsGrid3X2Gap />,
  },
];

function ReleaseListActions() {
  const { useDarkText, releaseListViewMode, setViewMode } = useStore();
  return (
    <>
      {releaseListActions.map(({ viewMode, ariaLabel, icon }) => (
        <button
          key={viewMode}
          type="button"
          aria-label={ariaLabel}
          title={ariaLabel}
          onClick={() => setViewMode("releaseList", viewMode)}
          className={cx(buttonStyles.button, {
            [buttonStyles.useDarkText]: useDarkText,
            [buttonStyles.active]: releaseListViewMode === viewMode,
          })}
        >
          {icon}
        </button>
      ))}
    </>
  );
}

function ArtistListActions() {
  const { useDarkText, artistsViewMode, setViewMode } = useStore();
  return (
    <>
      <button
        type="button"
        aria-label="Show Latest Artists"
        title="Show Latest Artists"
        onClick={() => setViewMode("artists", "latest")}
        className={cx(buttonStyles.button, {
          [buttonStyles.useDarkText]: useDarkText,
          [buttonStyles.active]: artistsViewMode === "latest",
        })}
      >
        <IoMdTime />
      </button>
      <button
        type="button"
        aria-label="Show Artist List"
        title="Show Artist List"
        onClick={() => setViewMode("artists", "alphabetical")}
        className={cx(buttonStyles.button, {
          [buttonStyles.useDarkText]: useDarkText,
          [buttonStyles.active]: artistsViewMode === "alphabetical",
        })}
      >
        <BsAlphabet />
      </button>
    </>
  );
}
