import React, { useState, useEffect, type MouseEvent, ReactNode } from "react";
import { NavLink, Routes, Route, useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { listViewModesMap, ListViews } from "@/types/types";
import { type Modals } from "../Modal";
import { useKeyManager } from "../hooks/useKeyboardManager";
import useClickOutside from "../hooks/useClickOutside";
import useOnLocationChange from "../hooks/useOnLocationChange";
import useStore from "../store";
import api from "../api";
import { capitalize } from "lodash";

import Breadcrumbs from "./Breadcrumbs";
import { IoMenu } from "react-icons/io5";
import {
  MdOutlineSearch,
  MdOutlineDriveFolderUpload,
  MdEdit,
} from "react-icons/md";

import { Icon, listActionsIconMap, type SupportedIcons } from "../icons";

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

type NavProps = {
  isDetailPage: boolean;
};

export default function Nav({ isDetailPage }: NavProps) {
  const navigate = useNavigate();
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
          <Route
            path="/releases/:id"
            element={<EditActions entity="release" />}
          />
          <Route
            path="/artists"
            element={<ListViewModeActions list="artist" />}
          />
          <Route
            path="/artists/:id"
            element={
              <>
                <ListViewModeActions list="release" />
                <ActionsGroup>
                  <ImportActions />
                  <EditActions entity="artist" />
                </ActionsGroup>
              </>
            }
          />
          <Route
            path="/collections"
            element={<ListViewModeActions list="collection" />}
          />
          <Route
            path="/collections/:id"
            element={
              <>
                <ListViewModeActions list="release" />
                <EditActions entity="collection" />
              </>
            }
          />
          <Route
            path="/groups"
            element={<ListViewModeActions list="group" />}
          />
          <Route path="/groups/:id" element={<EditActions entity="group" />} />
          <Route path="*" element={null} />
        </Routes>
        <ActionsGroup>
          <button
            type="button"
            aria-label={t("nav.common.actions.toggleMenu")}
            title={t("nav.common.actions.toggleMenu")}
            onClick={() => setNavOpen((prev) => !prev)}
            className={cx(buttonStyles.button, {
              [buttonStyles.useDarkText]: useDarkText,
            })}
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
        </ActionsGroup>
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
                  setModalContents({ name: link as Modals });
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
      onClick={() => api.menu.click("importFolder")}
      className={cx(buttonStyles.button, {
        [buttonStyles.useDarkText]: useDarkText,
      })}
    >
      <MdOutlineDriveFolderUpload />
    </button>
  );
}

type EditActionsProps = {
  entity: "artist" | "release" | "collection" | "group";
};

function EditActions({ entity }: EditActionsProps) {
  const { useDarkText } = useStore();
  const { t } = useTranslation();
  const capitalEntity = capitalize(entity);
  return (
    <button
      type="button"
      aria-label={t("nav.edit.actions.editEntity", { entity: capitalEntity })}
      title={t("nav.edit.actions.editEntity", { entity: capitalEntity })}
      onClick={() => api.menu.click(`edit${capitalEntity}`)}
      className={cx(buttonStyles.button, {
        [buttonStyles.useDarkText]: useDarkText,
      })}
    >
      <MdEdit />
    </button>
  );
}

function ActionsGroup({ children }: { children: ReactNode }) {
  return <div className={styles.ActionsGroup}>{children}</div>;
}

type ListViewModeActionsProps = {
  list: ListViews;
};

function ListViewModeActions({ list }: ListViewModeActionsProps) {
  const { useDarkText, isListViewMode, setListViewMode } = useStore();
  const { t } = useTranslation();

  const actions = listViewModesMap[list].map((viewMode) => ({
    viewMode,
    key: `nav.lists.${list}.viewModes.${viewMode}`,
    icon: listActionsIconMap[viewMode],
  }));

  return (
    <ActionsGroup>
      {actions.map(({ viewMode, key, icon }) => (
        <button
          key={viewMode}
          type="button"
          aria-label={t(key)}
          title={t(key)}
          onClick={() => setListViewMode(list, viewMode)}
          className={cx(buttonStyles.button, {
            [buttonStyles.useDarkText]: useDarkText,
            [buttonStyles.active]: isListViewMode(list, viewMode),
          })}
        >
          {icon}
        </button>
      ))}
    </ActionsGroup>
  );
}
