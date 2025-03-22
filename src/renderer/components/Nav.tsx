import styles from "./Nav.module.css";
import { NavLink } from "react-router";

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
    return (
        <nav className={styles.nav}>
            {navMap.map(({ link, label }) => (
                <NavLink
                    key={link}
                    to={link}
                    className={({ isActive }) =>
                        isActive ? styles.isActive : undefined
                    }
                >
                    {label}
                </NavLink>
            ))}
        </nav>
    );
}
