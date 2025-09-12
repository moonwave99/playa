import { useState } from "react";
import type { FormEvent } from "react";
import api from "../api";
import useRefetch from "../hooks/useRefetch";
import type {
  ReleaseType,
  ReleaseWithArtist,
  ReleaseWithArtistAndSubReleases,
  NewReleaseInfo,
} from "@/types/types";
import { didReleaseInfoChange } from "@/lib/utils";
import AdditionalArtistsEditor from "./AdditionalArtistsEditor";
import cx from "clsx";
import { MdInfoOutline } from "react-icons/md";
import styles from "./EditReleaseView.module.css";
import formStyles from "../forms.module.css";

const labelMap = {
  newTitle: {
    label: "Title",
    placeholder: "Enter title",
  },
  newDiscTitle: {
    label: "Disc Title",
    placeholder: "Enter disc title",
  },
  newPath: {
    label: "Path",
    placeholder: "Enter path",
  },
  newYear: {
    label: "Year",
    placeholder: "Enter year",
  },
  newType: {
    label: "Release Type",
    placeholder: "Enter release type",
  },
};

const releaseTypes = [
  "Album",
  "EP",
  "Single",
  "Compilation",
  "Bootleg",
  "Various",
  "Tribute",
  "Soundtrack",
] as ReleaseType[];

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

    api.state.selectReleases([]);
    api.state.refreshCurrentArtist();
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

  return (
    <div className={styles.EditReleaseView}>
      <h2>Edit Release</h2>
      <form onSubmit={onSubmit} className={formStyles.form}>
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
          <div className={formStyles.info}>
            <MdInfoOutline />
            This will move the Release folder in your Library.
          </div>
          <button
            type="submit"
            className={formStyles.button}
            disabled={!canSubmit()}
          >
            Edit Release
          </button>
          <button
            type="button"
            className={formStyles.button}
            onClick={onCancel}
          >
            Cancel
          </button>
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
  function getTitle() {
    if (isMainRelease || !hasMultipleDiscs || !release.discTitle) {
      return release.title;
    }
    return `${release.title} - ${release.discTitle}`;
  }

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
        <Field
          hasFocus={hasFocus && !isMainRelease}
          name="newPath"
          release={release}
          onInput={onInput}
          isVertical
        />
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
  return (
    <label
      className={cx(formStyles.label, styles.label, className, {
        [formStyles.vertical]: isVertical,
      })}
    >
      {labelMap[name].label}
      <input
        type={type}
        autoFocus={hasFocus}
        className={cx(formStyles.input, styles.input)}
        required
        placeholder={labelMap[name].placeholder}
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
  return (
    <label
      className={cx(formStyles.label, styles.label, {
        [formStyles.vertical]: isVertical,
      })}
    >
      {labelMap.newType.label}
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
