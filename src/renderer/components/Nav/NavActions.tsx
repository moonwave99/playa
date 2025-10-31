import { ListViews, listViewModesMap } from "@/types/types";
import type { UseNav } from "./useNav";
import api from "@/renderer/api";
import { listActionsIconMap } from "@/renderer/icons";
import { capitalize } from "lodash";
import { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { IoMenu } from "react-icons/io5";
import {
  MdOutlineSearch,
  MdOutlineDriveFolderUpload,
  MdEdit,
} from "react-icons/md";
import { Routes, Route } from "react-router";
import useStore from "@/renderer/store";

import cx from "clsx";
import styles from "./Nav.module.css";
import buttonStyles from "@/renderer/buttons.module.css";
import responsiveStyles from "@/renderer/responsive.module.css";

type NavActionsProps = Pick<UseNav, "toggleNav" | "openModal" | "useDarkText">;

export default function NavActions({
  toggleNav,
  openModal,
  useDarkText,
}: NavActionsProps) {
  const { t } = useTranslation();
  return (
    <div className={styles.actions}>
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
        <Route path="/groups" element={<ListViewModeActions list="group" />} />
        <Route path="/groups/:id" element={<EditActions entity="group" />} />
        <Route path="*" element={null} />
      </Routes>
      <ActionsGroup>
        <button
          type="button"
          aria-label={t("nav.common.actions.toggleMenu")}
          title={t("nav.common.actions.toggleMenu")}
          onClick={() => toggleNav()}
          className={cx(buttonStyles.button, styles.button, {
            [buttonStyles.useDarkText]: useDarkText,
          })}
        >
          <IoMenu />
        </button>
        <button
          type="button"
          aria-label={t("nav.common.actions.openSearch")}
          title={t("nav.common.actions.openSearch")}
          onClick={() => openModal("search")}
          className={cx(buttonStyles.button, styles.button, {
            [buttonStyles.useDarkText]: useDarkText,
          })}
        >
          <MdOutlineSearch />
        </button>
      </ActionsGroup>
    </div>
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
      className={cx(buttonStyles.button, styles.button, {
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
      className={cx(
        buttonStyles.button,
        styles.button,
        responsiveStyles.hideOnSmallViewPort,
        {
          [buttonStyles.useDarkText]: useDarkText,
        }
      )}
    >
      <MdEdit />
    </button>
  );
}

type ActionsGroup = {
  children: ReactNode;
  className?: string;
};

function ActionsGroup({ children, className }: ActionsGroup) {
  return <div className={cx(styles.ActionsGroup, className)}>{children}</div>;
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
    <ActionsGroup
      className={cx(styles.SelectGroup, responsiveStyles.hideOnMediumViewPort)}
    >
      {actions.map(({ viewMode, key, icon }) => (
        <button
          key={viewMode}
          type="button"
          aria-label={t(key)}
          title={t(key)}
          onClick={() => setListViewMode(list, viewMode)}
          className={cx(buttonStyles.button, styles.button, {
            [buttonStyles.useDarkText]: useDarkText,
            [styles.active]: isListViewMode(list, viewMode),
          })}
        >
          {icon}
        </button>
      ))}
    </ActionsGroup>
  );
}
