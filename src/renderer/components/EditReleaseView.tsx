import { useState } from "react";
import type { FormEvent } from "react";
import { useTranslation } from "react-i18next";
import useStore from "../store";
import api from "../api";
import useRelease from "../query/useRelease";
import type {
  ReleaseWithArtist,
  ReleaseWithArtistAndSubReleases,
  NewReleaseInfo,
  EditReleaseParam,
} from "@/types/types";
import { releaseTypes } from "@/types/types";
import { didReleaseInfoChange } from "@/lib/utils";

import EntityCardList from "./EntityCardList";
import LookupEntityForm from "./LookupEntityForm";
import Loading from "./Loading";

import cx from "clsx";
import { MdInfoOutline } from "react-icons/md";
import styles from "./EditReleaseView.module.css";
import formStyles from "../forms.module.css";

type EditReleaseViewProps = {
  id: number;
  closeModal: () => void;
};

export default function EditReleaseView({
  id,
  closeModal,
}: EditReleaseViewProps) {
  const { t } = useTranslation();
  const {
    isPending,
    release,
    addNewAdditionalArtist,
    addAdditionalArtist,
    removeAdditionalArtist,
    editRelease,
  } = useRelease({
    id,
  });

  function onSubmit(infos: EditReleaseParam[]) {
    editRelease(infos);
    api.state.setSelection("release", []);
    closeModal();
  }

  function onAdditionalArtistSubmit({
    id,
    title,
  }: {
    id: number;
    title: string;
  }) {
    if (!id) {
      addNewAdditionalArtist(title);
      return;
    }
    addAdditionalArtist(id);
  }

  if (isPending) {
    return <Loading />;
  }

  return (
    <div className={styles.EditReleaseView}>
      <h2>{t(`modals.EditReleaseView.title`)}</h2>
      <EditReleaseFormView
        release={release}
        onSubmit={onSubmit}
        onCancel={closeModal}
      />
      <div className={formStyles.container}>
        <h3>{t("modals.EditReleaseView.additionalArtists.title")}</h3>
        {release.additionalArtists.length ? (
          <EntityCardList
            items={release.additionalArtists}
            getRemoveButtonLabel={({ name }) =>
              t("modals.EditReleaseView.additionalArtists.actions.remove", {
                name,
              })
            }
            onRemoveEntityClick={({ id }) => removeAdditionalArtist(id)}
          />
        ) : (
          <p className={styles.placeholder}>
            {t("modals.EditReleaseView.additionalArtists.placeholder")}
          </p>
        )}
        <LookupEntityForm
          allowCustomValue
          className={styles.lookupView}
          existingIds={[
            release.artist.id,
            ...release.additionalArtists.map(({ id }) => id),
          ]}
          type="artist"
          onSubmit={onAdditionalArtistSubmit}
          placeholderText={t(
            "modals.EditReleaseView.additionalArtists.fields.lookup.placeholder"
          )}
        />
      </div>
    </div>
  );
}

type EditReleaseFormViewProps = {
  release: ReleaseWithArtistAndSubReleases;
  onSubmit: (infos: EditReleaseParam[]) => void;
  onCancel: () => void;
};

function EditReleaseFormView({
  release,
  onSubmit,
  onCancel,
}: EditReleaseFormViewProps) {
  const { t } = useTranslation();
  const { settings } = useStore();
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

  async function _onSubmit(event: FormEvent) {
    event.preventDefault();
    onSubmit(
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
    <form onSubmit={_onSubmit} className={formStyles.form}>
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
    </form>
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
