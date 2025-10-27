import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ReleaseWithArtist } from "@/types/types";
import { useKeyManager, withPrevent } from "../hooks/useKeyboardManager";
import useRelease from "../query/useRelease";
import ReleaseWithTracklistView from "./ReleaseWithTracklistView";
import Cover from "./Cover";

import { IoChevronBackOutline, IoChevronForwardOutline } from "react-icons/io5";
import cx from "clsx";
import styles from "./ReleaseLightbox.module.css";

type ReleaseLightboxProps = {
  id: number;
  context?: ReleaseWithArtist[];
  onClose: () => void;
  hideSidebar?: boolean;
};

export default function ReleaseLightbox({
  id,
  context,
  onClose,
  hideSidebar = false,
}: ReleaseLightboxProps) {
  const { t } = useTranslation();
  const [currentId, setCurrentId] = useState(id);
  const { release, isPending } = useRelease({ id: currentId });
  const currentIndex = context?.findIndex((x) => x.id === currentId);

  function showNextRelease() {
    if (isPending) {
      return;
    }
    setCurrentId(context[(currentIndex + 1) % context.length].id);
  }

  function showPrevRelease() {
    if (isPending) {
      return;
    }
    setCurrentId(
      context[currentIndex === 0 ? context.length - 1 : currentIndex - 1].id
    );
  }

  const { setContext } = useKeyManager({
    context: "modal",
    handlers: {
      " ": withPrevent(onClose),
      ArrowDown: () => setContext("modal:list"),
      ...(context?.length > 1
        ? {
            ArrowRight: showNextRelease,
            ArrowLeft: showPrevRelease,
          }
        : {}),
    },
  });

  return (
    <div className={styles.view} data-testid="ReleaseLightbox">
      {context?.length > 1 && (
        <button
          className={cx(styles.button, styles.prev)}
          aria-label={t("modals.ReleaseLightbox.actions.prev")}
          onClick={showPrevRelease}
        >
          <IoChevronBackOutline />
        </button>
      )}
      <div className={styles.wrapper} key={currentId}>
        {isPending ? null : (
          <>
            <Cover {...release} className={styles.cover} />
            <ReleaseWithTracklistView
              className={cx(styles.info, { [styles.hideSidebar]: hideSidebar })}
              isSingle
              hideCover
              release={release}
              onLinkClick={onClose}
              context="modal:list"
            />
          </>
        )}
      </div>
      {context?.length > 1 && (
        <button
          className={cx(styles.button, styles.next)}
          aria-label={t("modals.ReleaseLightbox.actions.next")}
          onClick={showNextRelease}
        >
          <IoChevronForwardOutline />
        </button>
      )}
    </div>
  );
}
