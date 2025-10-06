import { useState, useEffect } from "react";
import type { MouseEvent, ReactNode } from "react";
import { NavLink, Routes, Route } from "react-router";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
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
      data-testid="nav"
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
          aria-label={t("nav.common.actions.toggleMenu")}
          title={t("nav.common.actions.toggleMenu")}
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
          aria-label={t("nav.common.actions.openSearch")}
          title={t("nav.common.actions.openSearch")}
          onClick={() => {
            setModalContents({ name: "search" });
            setNavOpen(false);
          }}
          className={cx(buttonStyles.button, {
            [buttonStyles.useDarkText]: useDarkText,
          })}
        >
          <MdOutlineSearch />
        </button>
      </div>
      <ul className={styles.entries} ref={ref}>
        {navMap.map(({ link, label, type, accelerator, section }, index) => (
          <li
            key={link}
            className={cx(styles.entry, {
              [styles.hasFocus]: index === currentIndex,
            })}
          >
            <Icon isFor={section} />
            {type === "link" ? (
              <NavLink
                aria-label={`Go to the ${label} page`}
                to={link}
                onDragStart={(event) => event.preventDefault()}
                onClick={(event: MouseEvent) => {
                  if (event.metaKey) {
                    event.preventDefault();
                  }
                  setNavOpen(false);
                }}
                onFocus={() => setCurrentIndex(index)}
              >
                {label}
              </NavLink>
            ) : (
              <button
                onClick={() => {
                  setModalContents({ name: link });
                  setNavOpen(false);
                }}
                onFocus={() => setCurrentIndex(index)}
              >
                {label}
              </button>
            )}
            <span className={styles.accelerator}>{accelerator}</span>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function ImportActions() {
  const { useDarkText } = useStore();
  const { t } = useTranslation();
  return (
    <button
      type="button"
      aria-label={t("nav.import.actions.importReleases")}
      title={t("nav.import.actions.importReleases")}
      onClick={() => api.importFolders.importFolderFromDialog()}
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
  key: string;
  icon: ReactNode;
}[] = [
  {
    viewMode: "grid",
    key: "nav.release.actions.setGridViewMode",
    icon: <BsGrid />,
  },
  {
    viewMode: "list",
    key: "nav.release.actions.setListViewMode",
    icon: <BsListOl />,
  },
  {
    viewMode: "compact",
    key: "nav.release.actions.setCompactViewMode",
    icon: <BsGrid3X2Gap />,
  },
];

function ReleaseListActions() {
  const { useDarkText, releaseListViewMode, setViewMode } = useStore();
  const { t } = useTranslation();
  return (
    <>
      {releaseListActions.map(({ viewMode, key, icon }) => (
        <button
          key={viewMode}
          type="button"
          aria-label={t(key)}
          title={t(key)}
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
  const { t } = useTranslation();
  return (
    <>
      <button
        type="button"
        aria-label={t("nav.artist.actions.showLatestArtists")}
        title={t("nav.artist.actions.showLatestArtists")}
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
        aria-label={t("nav.artist.actions.showArtistsList")}
        title={t("nav.artist.actions.showArtistsList")}
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
