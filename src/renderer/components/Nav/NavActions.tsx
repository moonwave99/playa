import { type ReactNode } from "react";
import { Routes, Route } from "react-router";
import { useTranslation } from "react-i18next";
import { ListViews, listViewModesMap } from "@/types/types";
import api from "@/renderer/api";
import { Icon } from "@/renderer/icons";
import type { UseNav } from "./useNav";
import useStore from "@/renderer/store";
import { capitalize } from "lodash";

import cx from "clsx";
import styles from "./Nav.module.css";
import buttonStyles from "@/renderer/buttons.module.css";
import responsiveStyles from "@/renderer/responsive.module.css";
import Link from "../Link";

type NavActionsProps = Pick<
  UseNav,
  "toggleNav" | "openModal" | "useDarkText" | "isSearchPage"
>;

export default function NavActions({
  toggleNav,
  useDarkText,
  isSearchPage,
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
          <Icon isFor="actions.toggleMenu" />
        </button>
        <Link
          aria-label={t("nav.common.actions.gotoSearch")}
          title={t("nav.common.actions.gotoSearch")}
          to="/search"
          className={cx(buttonStyles.button, styles.button, {
            [buttonStyles.useDarkText]: useDarkText,
          })}
          onClick={(event) => {
            if (!isSearchPage) {
              return;
            }
            event.preventDefault();
          }}
        >
          <Icon isFor="actions.search" />
        </Link>
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
      <Icon isFor="actions.import" />
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
      onClick={() => api.menu.click(`editCurrent${capitalEntity}`)}
      className={cx(
        buttonStyles.button,
        styles.button,
        responsiveStyles.hideOnSmallViewPort,
        {
          [buttonStyles.useDarkText]: useDarkText,
        }
      )}
    >
      <Icon isFor="actions.edit" />
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
    icon: <Icon isFor={`listViewModes.${viewMode}`} />,
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
