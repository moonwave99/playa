import { type MouseEvent } from "react";
import { NavLink } from "react-router";
import { useTranslation } from "react-i18next";
import { type Modals } from "@/renderer/Modal";
import useNav from "./useNav";
import { Icon } from "@/renderer/icons";
import Breadcrumbs from "./Breadcrumbs";

import cx from "clsx";
import styles from "./Nav.module.css";
import HistoryView from "./HistoryView";
import NavActions from "./NavActions";
import NavTitle from "./NavTitle";

type NavProps = {
  isFullHeaderPage: boolean;
};

export default function Nav({ isFullHeaderPage }: NavProps) {
  const { t } = useTranslation();
  const {
    ref,
    navMap,
    isNavOpen,
    useDarkText,
    openModal,
    currentIndex,
    setCurrentIndex,
    toggleNav,
  } = useNav();

  return (
    <nav
      className={cx(styles.nav, {
        [styles.isOpen]: isNavOpen,
        [styles.isFullHeaderPage]: isFullHeaderPage,
      })}
      ref={ref}
      data-testid="nav"
    >
      <div className={styles.leftWrapper}>
        <HistoryView />
        <Breadcrumbs
          isFullHeaderPage={isFullHeaderPage}
          useDarkText={useDarkText}
        />
      </div>
      <NavTitle />
      <NavActions
        useDarkText={useDarkText}
        toggleNav={toggleNav}
        openModal={openModal}
      />
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
                aria-label={t("nav.common.actions.gotoPage", { page: label })}
                to={link}
                onDragStart={(event) => event.preventDefault()}
                onClick={(event: MouseEvent) => {
                  if (event.metaKey) {
                    event.preventDefault();
                  }
                  toggleNav(false);
                }}
                onFocus={() => setCurrentIndex(index)}
              >
                {label}
              </NavLink>
            ) : (
              <button
                onClick={() => openModal(link as Modals)}
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
