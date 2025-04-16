import { useState, useEffect } from "react";
import type { MouseEvent } from "react";
import { NavLink } from "react-router";
import { useKeyManager } from "../hooks/useKeyboardManager";
import useClickOutside from "../hooks/useClickOutside";
import useStore from "../store";
import cx from "clsx";
import { IoMenu } from "react-icons/io5";
import styles from "./Nav.module.css";
import buttonStyles from "../buttons.module.css";

const navMap = [
    {
        link: "/",
        label: "Latest Releases",
    },
    {
        link: "/artists",
        label: "Latest Artists",
    },
    {
        link: "/collections",
        label: "Latest Collections",
    },
    {
        link: "/groups",
        label: "Latest Groups",
    },
];

export default function Nav() {
    const [isNavOpen, setNavOpen] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(-1);
    const ref = useClickOutside(() => setNavOpen(false));
    const { setModalContents, useDarkText } = useStore();
    const { setContext } = useKeyManager({
        context: "nav",
        handlers: {
            Escape: () => setNavOpen(false),
            ArrowDown: () =>
                setCurrentIndex((prev) => Math.min(prev + 1, navMap.length)),
            ArrowUp: () => setCurrentIndex((prev) => Math.max(0, prev - 1)),
        },
    });

    useEffect(() => {
        setContext(isNavOpen ? "nav" : "list");
        setCurrentIndex(isNavOpen ? 0 : -1);
    }, [isNavOpen]);

    useEffect(() => {
        const target = ref.current.querySelector(
            `[data-nav-id="${currentIndex}"]`
        );
        target?.focus();
    }, [currentIndex]);

    return (
        <nav
            className={cx(styles.nav, { [styles.isOpen]: isNavOpen })}
            ref={ref}
        >
            <button
                className={cx(buttonStyles.button, styles.button, {
                    [buttonStyles.useDarkText]: useDarkText,
                })}
                onClick={() => setNavOpen((prev) => !prev)}
                aria-label="Toggle Navigation"
            >
                <IoMenu />
            </button>
            <div className={styles.entries} ref={ref}>
                {navMap.map(({ link, label }, index) => (
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
                    </NavLink>
                ))}
                <button
                    data-nav-id={navMap.length}
                    className={cx(styles.link, {
                        [styles.hasFocus]: currentIndex === navMap.length,
                    })}
                    onClick={() => {
                        setModalContents({ name: "settings" });
                        setNavOpen(false);
                    }}
                >
                    Settings
                </button>
            </div>
        </nav>
    );
}
