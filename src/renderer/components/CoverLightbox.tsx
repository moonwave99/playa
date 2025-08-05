import { useState } from "react";
import { ReleaseWithArtist } from "@/types/types";
import Cover from "./Cover";
import { useKeyManager, withPrevent } from "../hooks/useKeyboardManager";
import { IoChevronBackOutline, IoChevronForwardOutline } from "react-icons/io5";

import cx from "clsx";
import styles from "./CoverLightbox.module.css";

type CoverLightboxProps = {
    release: ReleaseWithArtist;
    context?: ReleaseWithArtist[];
    onClose: () => void;
};

export default function CoverLightbox({
    release,
    context,
    onClose,
}: CoverLightboxProps) {
    const [currentRelease, setCurrentRelease] = useState(release);
    const currentIndex = context?.findIndex((x) => x.id === currentRelease.id);

    function showNextRelease() {
        setCurrentRelease(context[(currentIndex + 1) % context.length]);
    }

    function showPrevRelease() {
        setCurrentRelease(
            context[currentIndex === 0 ? context.length - 1 : currentIndex - 1]
        );
    }

    useKeyManager({
        context: "modal",
        handlers: {
            " ": withPrevent(onClose),
            ...(context?.length > 1
                ? {
                      ArrowRight: showNextRelease,
                      ArrowLeft: showPrevRelease,
                  }
                : {}),
        },
    });

    return (
        <div className={styles.CoverLightbox}>
            {context?.length > 1 && (
                <button
                    className={cx(styles.button, styles.prev)}
                    aria-label="See previous Release Cover"
                    onClick={showPrevRelease}
                >
                    <IoChevronBackOutline />
                </button>
            )}
            <Cover
                {...currentRelease}
                key={currentRelease.id}
                className={styles.cover}
            />
            <h3 className={styles.title}>
                {currentRelease.artist.name} - {currentRelease.title}
            </h3>
            {context?.length > 1 && (
                <button
                    className={cx(styles.button, styles.next)}
                    aria-label="See next Release Cover"
                    onClick={showNextRelease}
                >
                    <IoChevronForwardOutline />
                </button>
            )}
        </div>
    );
}
