import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ReleaseWithArtist } from "@/types/types";
import { useKeyManager, withPrevent } from "../hooks/useKeyboardManager";
import useStore from "../store";
import useRelease from "../query/useRelease";
import { getReleaseTitle } from "@/lib/utils";
import api from "../api";

import Cover from "./Cover";
import Tracklist from "./Tracklist";
import ReleaseInfo from "./ReleaseInfo";
import EntityList from "./EntityList";

import { Icon } from "../icons";
import cx from "clsx";
import styles from "./ReleaseLightbox.module.css";

type ReleaseLightboxProps = {
  id: number;
  context?: ReleaseWithArtist[];
  closeModal: () => void;
  hideSidebar?: boolean;
};

export default function ReleaseLightbox({
  id,
  context,
  closeModal,
  hideSidebar = false,
}: ReleaseLightboxProps) {
  const { t } = useTranslation();
  const [currentId, setCurrentId] = useState(id);
  const { release, isPending } = useRelease({
    id: currentId,
    refreshOnLoad: true,
  });
  const currentIndex = context?.findIndex((x) => x.id === currentId);
  const { setLightBoxEntityId } = useStore();

  function showNextRelease() {
    if (isPending) {
      return;
    }
    const id = context[(currentIndex + 1) % context.length].id;
    setCurrentId(id);
    setLightBoxEntityId(id);
  }

  function showPrevRelease() {
    if (isPending) {
      return;
    }
    const id =
      context[currentIndex === 0 ? context.length - 1 : currentIndex - 1].id;
    setCurrentId(id);
    setLightBoxEntityId(id);
  }

  const { setContext } = useKeyManager({
    context: "modal",
    handlers: {
      " ": withPrevent(closeModal),
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
    <div
      className={cx(styles.view, { [styles.hideSidebar]: hideSidebar })}
      data-testid="ReleaseLightbox"
    >
      {context?.length > 1 && (
        <button
          className={cx(styles.button, styles.prev)}
          aria-label={t("modals.ReleaseLightbox.actions.prev")}
          onClick={showPrevRelease}
        >
          <Icon isFor="lightbox.prev" />
        </button>
      )}
      <div className={styles.wrapper} key={currentId}>
        {isPending ? (
          <div className={styles.placeholder}></div>
        ) : (
          <>
            <Cover {...release} className={styles.cover} avoidCache />
            {!hideSidebar && (
              <div className={styles.sidebar}>
                <header className={styles.header}>
                  <EntityList
                    linkClassName={styles.artist}
                    textOnly
                    context={release}
                    canDeleteFirstEntry={false}
                    items={[release.artist, ...release.additionalArtists]}
                  />
                  <h2 className={styles.title}>{getReleaseTitle(release)}</h2>
                  <ReleaseInfo release={release} isSingle />
                </header>
                <Tracklist
                  className={styles.tracklist}
                  isFlipped
                  release={release}
                  isNavigable
                  context="modal:list"
                  onDoubleClick={(track_id) =>
                    api.system.playback({
                      release_id: release.id,
                      track_id,
                    })
                  }
                />
              </div>
            )}
          </>
        )}
      </div>
      {context?.length > 1 && (
        <button
          className={cx(styles.button, styles.next)}
          aria-label={t("modals.ReleaseLightbox.actions.next")}
          onClick={showNextRelease}
        >
          <Icon isFor="lightbox.next" />
        </button>
      )}
    </div>
  );
}
