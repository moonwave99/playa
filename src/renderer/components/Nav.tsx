import { useState, useEffect } from "react";
import type { MouseEvent } from "react";
import { NavLink } from "react-router";
import { useKeyManager } from "../hooks/useKeyboardManager";
import useClickOutside from "../hooks/useClickOutside";
import useStore from "../store";
import cx from "clsx";
import { IoClose, IoMenu } from "react-icons/io5";
import styles from "./Nav.module.css";
import buttonStyles from "../buttons.module.css";
import { MdOutlineSearch } from "react-icons/md";
import Breadcrumbs from "./Breadcrumbs";

const navMap: {
  type: "link" | "modal";
  label: string;
  link: string;
  shortcut: string;
}[] = [
  {
    type: "link",
    link: "/",
    label: "Library",
    shortcut: "Cmd+Shift+H",
  },
  {
    type: "link",
    link: "/releases",
    label: "Releases",
    shortcut: "Cmd+1",
  },
  {
    type: "link",
    link: "/artists",
    label: "Artists",
    shortcut: "Cmd+2",
  },
  {
    type: "link",
    link: "/collections",
    label: "Collections",
    shortcut: "Cmd+3",
  },
  {
    type: "link",
    link: "/groups",
    label: "Groups",
    shortcut: "Cmd+4",
  },
  {
    type: "modal",
    link: "settings",
    label: "Settings",
    shortcut: "Cmd+,",
  },
];

type NavProps = {
  isDetailPage: boolean;
};

export default function Nav({ isDetailPage }: NavProps) {
  const [isNavOpen, setNavOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const ref = useClickOutside(() => setNavOpen(false));
  const { setModalContents, useDarkText, toggleSidebar, showSidebar } =
    useStore();
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

  return (
    <nav
      className={cx(styles.nav, {
        [styles.isOpen]: isNavOpen,
        [styles.isSidebarOpen]: showSidebar,
        [styles.isDetailPage]: isDetailPage,
      })}
      ref={ref}
    >
      <Breadcrumbs isDetailPage={isDetailPage} useDarkText={useDarkText} />
      <div className={styles.buttons}>
        <button
          type="button"
          aria-label="Toggle Navigation"
          onClick={() => setNavOpen((prev) => !prev)}
          className={cx(buttonStyles.button, {
            [buttonStyles.useDarkText]: useDarkText,
          })}
        >
          <IoMenu />
        </button>
        <button
          type="button"
          aria-label="Toggle Sidebar"
          onClick={() => toggleSidebar()}
          className={cx(buttonStyles.button, styles.toggleSidebarButton, {
            [styles.showSidebar]: showSidebar,
            [buttonStyles.useDarkText]: useDarkText,
          })}
        >
          {showSidebar ? <IoClose /> : <MdOutlineSearch />}
        </button>
      </div>
      <div className={styles.entries} ref={ref}>
        {navMap.map(({ link, label, type, shortcut }, index) =>
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
              {label}
              <span className={styles.shortcut}>{shortcut}</span>
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
              {label}
              <span className={styles.shortcut}>{shortcut}</span>
            </button>
          )
        )}
      </div>
    </nav>
  );
}
