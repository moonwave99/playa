import { useState } from "react";
import type { FormEvent } from "react";
import { useTranslation } from "react-i18next";
import useStore from "../store";
import useRefetch from "../hooks/useRefetch";
import api from "../api";
import type {
  ReleaseWithArtist,
  ReleaseWithArtistAndSubReleases,
  NewReleaseInfo,
} from "@/types/types";
import { releaseTypes } from "@/types/types";
import { didReleaseInfoChange } from "@/lib/utils";
import AdditionalArtistsEditor from "./AdditionalArtistsEditor";
import cx from "clsx";
import { MdInfoOutline } from "react-icons/md";
import styles from "./EditReleaseView.module.css";
import formStyles from "../forms.module.css";

type EditReleasesViewProps = {
  release: ReleaseWithArtistAndSubReleases;
  onSave: () => void;
  onCancel: () => void;
};

export default function EditReleasesView({
  release,
  onSave,
  onCancel,
}: EditReleasesViewProps) {
  const { t } = useTranslation();
  const { settings } = useStore();
  const refetch = useRefetch();
  const [folderInfo, setFolderInfo] = useState(
    [release, ...release.subReleases].map((x, index) => ({
      ...x,
      newPath: x.path,
      newDiscTitle:
        release.subReleases.length === 0
          ? x.discTitle
          : x.discTitle || `Disc ${index + 1}`,
      newTitle: x.title,
      newYear: x.year,
      newType: x.type,
    }))
  );

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const success = await api.release.editRelease(
      folderInfo
        .filter(
          (x) =>
            x.path !== x.newPath ||
            x.discTitle !== x.newDiscTitle ||
            x.title !== x.newTitle ||
            x.year !== x.newYear ||
            x.type !== x.newType
        )
        .map((x) => ({
          ...x,
          newTitle: folderInfo[0].newTitle,
          newType: folderInfo[0].newType,
          newYear: folderInfo[0].newYear,
        }))
    );
    if (!success) {
      return;
    }

    refetch([
      ["releases", "latest"],
      ["releases", release.id],
      ["artists", release.artist_id],
    ]);

    api.state.setSelection("release", []);
    onSave();
  }

  function updateInfo(
    index: number,
    key: keyof NewReleaseInfo,
    value: string | number
  ) {
    setFolderInfo((prev) =>
      prev.map((x, j) => (j === index ? { ...x, [key]: value } : x))
    );
  }

  function canSubmit() {
    return didReleaseInfoChange(folderInfo, folderInfo.length === 1);
  }

  const { USE_SMART_IMPORT } = settings;

  return (
    <div className={styles.EditReleaseView}>
      <h2>{t(`modals.EditReleaseView.title`)}</h2>
      <form onSubmit={onSubmit} className={formStyles.form}>
        <div className={cx(formStyles.container, formStyles.separator)}>
          <ul className={styles.releaseList}>
            {folderInfo.map((release, index) => (
              <li key={release.id}>
                <FolderView
                  hasFocus={index === 0}
                  isMainRelease={index === 0}
                  hasMultipleDiscs={folderInfo.length > 1}
                  release={release}
                  onInput={(key, value) => updateInfo(index, key, value)}
                />
              </li>
            ))}
          </ul>
          <div className={formStyles.actions}>
            {USE_SMART_IMPORT && (
              <div className={formStyles.info}>
                <MdInfoOutline />
                {t(`modals.EditReleaseView.moveInfo`)}
              </div>
            )}
            <button
              type="submit"
              className={formStyles.button}
              disabled={!canSubmit()}
            >
              {t(`modals.EditReleaseView.actions.submit`)}
            </button>
            <button
              type="button"
              className={formStyles.button}
              onClick={onCancel}
            >
              {t(`modals.EditReleaseView.actions.cancel`)}
            </button>
          </div>
        </div>
        <AdditionalArtistsEditor releaseId={release.id} />
      </form>
    </div>
  );
}

type FolderViewProps = {
  release: NewReleaseInfo & Pick<ReleaseWithArtist, "title" | "discTitle">;
  isMainRelease?: boolean;
  hasMultipleDiscs: boolean;
  hasFocus?: boolean;
  onInput: (key: keyof NewReleaseInfo, value: string | number) => void;
};

function FolderView({
  release,
  isMainRelease,
  hasMultipleDiscs,
  hasFocus,
  onInput,
}: FolderViewProps) {
  const { settings } = useStore();

  function getTitle() {
    if (isMainRelease || !hasMultipleDiscs || !release.discTitle) {
      return release.title;
    }
    return `${release.title} - ${release.discTitle}`;
  }

  const { USE_SMART_IMPORT } = settings;

  return (
    <article className={styles.release}>
      <h3 className={styles.releaseTitle}>{getTitle()}</h3>
      {isMainRelease ? (
        <>
          <div className={formStyles.horizontalGroup}>
            <Field
              hasFocus
              name="newTitle"
              release={release}
              onInput={onInput}
              isVertical
              className={styles.newTitle}
            />
            <Field
              name="newYear"
              release={release}
              onInput={onInput}
              type="number"
              isVertical
            />
            <ReleaseTypeField release={release} onInput={onInput} isVertical />
          </div>
        </>
      ) : null}
      <div className={formStyles.horizontalGroup}>
        {USE_SMART_IMPORT && (
          <Field
            hasFocus={hasFocus && !isMainRelease}
            name="newPath"
            release={release}
            onInput={onInput}
            isVertical
          />
        )}
        {hasMultipleDiscs ? (
          <Field
            name="newDiscTitle"
            release={release}
            onInput={onInput}
            isVertical
          />
        ) : null}
      </div>
    </article>
  );
}

type FieldProps = Pick<FolderViewProps, "release" | "onInput" | "hasFocus"> & {
  name: keyof NewReleaseInfo;
  type?: string;
  isVertical?: boolean;
  className?: string;
};

function Field({
  name,
  release,
  hasFocus,
  onInput,
  type = "text",
  isVertical = false,
  className,
}: FieldProps) {
  const { t } = useTranslation();
  return (
    <label
      className={cx(formStyles.label, styles.label, className, {
        [formStyles.vertical]: isVertical,
      })}
    >
      {t(`modals.EditReleaseView.fields.${name}.label`)}
      <input
        type={type}
        autoFocus={hasFocus}
        className={cx(formStyles.input, styles.input)}
        required
        placeholder={t(`modals.EditReleaseView.fields.${name}.placeholder`)}
        value={release[name]}
        onInput={(event: FormEvent) => {
          const value = (event.target as HTMLInputElement).value;
          onInput(name, type === "number" ? +value : value);
        }}
      />
    </label>
  );
}

type ReleaseTypeFieldProps = Omit<FieldProps, "name"> & {
  isVertical?: boolean;
};

function ReleaseTypeField({
  release,
  hasFocus,
  onInput,
  isVertical = false,
}: ReleaseTypeFieldProps) {
  const { t } = useTranslation();
  return (
    <label
      className={cx(formStyles.label, styles.label, {
        [formStyles.vertical]: isVertical,
      })}
    >
      {t(`modals.EditReleaseView.fields.newType.label`)}
      <select
        className={cx(formStyles.select, styles.select)}
        autoFocus={hasFocus}
        required
        value={release.newType}
        onChange={(event: FormEvent) =>
          onInput("newType", (event.target as HTMLInputElement).value)
        }
      >
        {releaseTypes.map((type) => (
          <option key={type}>{type}</option>
        ))}
      </select>
    </label>
  );
}
