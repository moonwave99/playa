import { useState } from "react";
import type { MouseEvent } from "react";
import { NavLink } from "react-router";
import useClickOutside from "../hooks/useClickOutside";
import cx from "clsx";
import useStore from "../store";
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
];

export default function Nav() {
    const [isNavOpen, setNavOpen] = useState(false);
    const ref = useClickOutside(() => setNavOpen(false));
    const { setModalContents, useDarkText } = useStore();

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
            <div className={styles.entries}>
                {navMap.map(({ link, label }) => (
                    <NavLink
                        key={link}
                        to={link}
                        className={styles.link}
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
                    className={styles.link}
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
