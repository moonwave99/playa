import { useState } from "react";
import type { FormEvent } from "react";
import { useTranslation } from "react-i18next";
import api from "../api";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  useSortable,
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { ReleaseWithArtist } from "@/types/types";
import Cover from "./Cover";
import { lowerCaseCompare } from "@/lib/utils";

import { PiDotsThreeVerticalBold } from "react-icons/pi";
import { MdInfoOutline } from "react-icons/md";
import cx from "clsx";
import styles from "./GroupReleasesView.module.css";
import formStyles from "../forms.module.css";

type GroupReleasesViewProps = {
  releases: ReleaseWithArtist[];
  onSave: () => void;
  onCancel: () => void;
};

export default function GroupReleasesView({
  releases,
  onSave,
  onCancel,
}: GroupReleasesViewProps) {
  const { t } = useTranslation();
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const [discInfo, setDiscInfo] = useState(
    releases
      .toSorted((a, b) => (a.title > b.title ? 1 : -1))
      .map((x) => ({ ...x, discTitle: x.title }))
  );

  async function onSubmit(event: FormEvent) {
    event.preventDefault();

    await api.release.groupReleases({
      mainRelease: {
        title: (event.target as HTMLFormElement).mainReleaseTitle.value,
        id: discInfo[0].id,
      },
      discInfo: discInfo.map(({ id, discTitle }, index) => ({
        id,
        title: discTitle,
        number: index + 1,
      })),
    });

    onSave();
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (active.id !== over.id) {
      setDiscInfo((prev) => {
        const oldIndex = prev.findIndex((x) => x.id === active.id);
        const newIndex = prev.findIndex((x) => x.id === over.id);
        return arrayMove(prev, oldIndex, newIndex);
      });
    }
  }

  function fillInfo() {
    setDiscInfo((prev) => {
      const bonusDisc = prev.findIndex((x) =>
        lowerCaseCompare(x.discTitle, "bonus disc")
      );

      if (bonusDisc > -1) {
        return prev.map((x, index) => ({
          ...x,
          discNumber: index + 1,
          discTitle: index === bonusDisc ? "Bonus Disc" : x.discTitle,
        }));
      }
      return prev.map((x, index) => ({
        ...x,
        discNumber: index + 1,
        discTitle: `Disc ${index + 1}`,
      }));
    });
  }

  function getMainReleaseTitle() {
    return discInfo[0].title.split(" CD").at(0);
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={discInfo} strategy={verticalListSortingStrategy}>
        <div className={styles.GroupReleasesView}>
          <h2>{t("modals.GroupReleasesView.title")}</h2>
          <form onSubmit={onSubmit} className={formStyles.form}>
            <label className={cx(formStyles.label)}>
              {t("modals.GroupReleasesView.fields.mainReleaseTitle.label")}
              <input
                autoFocus
                name="mainReleaseTitle"
                className={formStyles.input}
                required
                placeholder={t(
                  "modals.GroupReleasesView.fields.mainReleaseTitle.placeholder"
                )}
                defaultValue={getMainReleaseTitle()}
              />
              <button
                type="button"
                className={formStyles.button}
                onClick={fillInfo}
              >
                {t("modals.GroupReleasesView.actions.fillProgressively")}
              </button>
            </label>

            <ul className={styles.releaseList}>
              {discInfo.map((release, index) => (
                <li key={release.id}>
                  <DiscView
                    release={release}
                    onInput={(event: FormEvent) =>
                      setDiscInfo((prev) =>
                        prev.map((x, j) =>
                          j === index
                            ? {
                                ...x,
                                discTitle: (event.target as HTMLInputElement)
                                  .value,
                              }
                            : x
                        )
                      )
                    }
                  />
                </li>
              ))}
            </ul>
            <div className={formStyles.info}>
              <MdInfoOutline />
              {t("modals.GroupReleasesView.rearrangeInfo")}
            </div>
            <div className={formStyles.actions}>
              <button type="submit" className={formStyles.button}>
                {t("modals.GroupReleasesView.actions.submit")}
              </button>
              <button
                type="button"
                className={formStyles.button}
                onClick={onCancel}
              >
                {t("modals.GroupReleasesView.actions.cancel")}
              </button>
            </div>
          </form>
        </div>
      </SortableContext>
    </DndContext>
  );
}

type DiscViewProps = {
  release: ReleaseWithArtist & { discTitle: string };
  onInput: (event: FormEvent) => void;
};

function DiscView({ release, onInput }: DiscViewProps) {
  const { t } = useTranslation();
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: release.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <article className={styles.release} ref={setNodeRef} style={style}>
      <div className={styles.dragHandle} {...attributes} {...listeners}>
        <PiDotsThreeVerticalBold />
        <Cover
          className={styles.cover}
          droppable={false}
          dragOutside={false}
          {...release}
        />
      </div>
      <label
        className={cx(
          formStyles.label,
          formStyles.vertical,
          styles.label,
          styles.vertical
        )}
      >
        {t("modals.GroupReleasesView.fields.subReleaseTitle.label", release)}
        <input
          className={cx(formStyles.input, styles.input)}
          required
          placeholder={t(
            "modals.GroupReleasesView.fields.subReleaseTitle.placeholder"
          )}
          value={release.discTitle}
          onInput={onInput}
        />
      </label>
    </article>
  );
}
