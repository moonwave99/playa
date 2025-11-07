import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import {
  releaseTypes,
  ImportData,
  TrackInfo,
  ReleaseType,
} from "@/types/types";
import useArtists from "../query/useArtists";
import api from "../api";
import LookupView from "./Lookup/LookupView";
import ErrorView from "./ErrorView";
import Loading from "./Loading";
import { Icon } from "../icons";
import cx from "clsx";
import styles from "./ImportFoldersView.module.css";
import formStyles from "../forms.module.css";
import { normalizeArtistDisplayName } from "@/lib/utils";

type ImportFoldersViewProps = {
  data: ImportData[];
  closeModal: () => void;
};

type ImportStatus = {
  folder: string;
  isDone: boolean;
};

export default function ImportFoldersView({
  data,
  closeModal,
}: ImportFoldersViewProps) {
  const { t } = useTranslation();
  const [index, setIndex] = useState(0);
  const [importStatus, setImportStatus] = useState(
    data.map(({ folder }) => ({ folder, isDone: false }))
  );

  async function onImport() {
    setImportStatus((prev) =>
      prev.map((x, i) => (i === index ? { ...x, isDone: true } : x))
    );
    gotoNextFolder();
  }

  function gotoNextFolder() {
    setIndex((prev) => Math.min(prev + 1, data.length - 1));
    if (index === data.length - 1) {
      closeModal();
    }
  }

  return (
    <div className={styles.view}>
      {importStatus.length > 1 && (
        <FolderList importStatus={importStatus} index={index} />
      )}
      <div className={styles.main}>
        <h2>{t("modals.ImportFoldersView.title")}</h2>
        <FolderView
          key={index}
          data={data[index]}
          isImportingMultipleFolders={data.length > 1}
          isLast={index === data.length - 1}
          onImport={onImport}
          onSkip={gotoNextFolder}
          onCancel={closeModal}
        />
      </div>
    </div>
  );
}

type FolderViewProps = {
  data: ImportData;
  isImportingMultipleFolders: boolean;
  isLast: boolean;
  onImport: () => void;
  onCancel: () => void;
  onSkip: () => void;
};

function FolderView({
  data,
  isImportingMultipleFolders,
  isLast,
  onImport,
  onCancel,
  onSkip,
}: FolderViewProps) {
  const { t } = useTranslation();
  const [artistQuery, setArtistQuery] = useState("");
  const [tempData, setTempData] = useState({ ...data });
  const [isImporting, setImporting] = useState(false);
  const [isRefreshing, setRefreshing] = useState(false);
  const { artists, isPending, error } = useArtists();

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setImporting(true);
    const response = await api.importFolders.importFromData(tempData);
    setImporting(false);
    if (!response) {
      window.alert(t("modals.ImportFoldersView.errors.import"));
      return;
    }
    onImport();
  }

  function onTrackEdit(info: TrackInfo, index: number) {
    setTempData((prev) => ({
      ...prev,
      tracks: prev.tracks.map((t, i) => (i === index ? info : t)),
    }));
  }

  function openTagger() {
    api.system.openFolderInTagger(data.path);
  }

  async function refreshTracksInfo() {
    setRefreshing(true);
    setTempData(await api.importFolders.getTracksInfo(data.path));
    setRefreshing(false);
  }

  if (isPending) {
    return <Loading />;
  }

  if (error) {
    return <ErrorView error={error} />;
  }

  return (
    <form
      className={cx(formStyles.form, formStyles.compact, styles.folderView, {
        [styles.isImportingMultipleFolders]: isImportingMultipleFolders,
      })}
      onSubmit={onSubmit}
    >
      <header className={styles.FolderViewHeader}>
        <h3>{t("modals.ImportFoldersView.folderView.title")}</h3>
        <button
          type="button"
          onClick={refreshTracksInfo}
          className={formStyles.button}
          disabled={isImporting || isRefreshing}
        >
          {isRefreshing ? (
            <Loading size="small" />
          ) : (
            t("modals.ImportFoldersView.actions.refreshTracksInfo")
          )}
        </button>
        <button
          type="button"
          onClick={openTagger}
          className={formStyles.button}
          disabled={isImporting}
        >
          {t("modals.ImportFoldersView.actions.openTagger")}
        </button>
      </header>
      {isImportingMultipleFolders && (
        <div className={styles.panel}>
          <label className={cx(formStyles.label, formStyles.vertical)}>
            {t("modals.ImportFoldersView.release.path.label")}
            <input
              className={formStyles.input}
              defaultValue={data.path}
              readOnly
              tabIndex={-1}
            />
          </label>
        </div>
      )}
      <div className={styles.panel}>
        <label className={cx(formStyles.label, formStyles.vertical)}>
          {t("modals.ImportFoldersView.release.artist.label")}
          <LookupView
            allowCustomValue
            className={styles.artist}
            value={tempData.artist}
            items={artists}
            query={artistQuery}
            onQueryChange={setArtistQuery}
            onChange={(artist) =>
              setTempData((prev) => ({
                ...prev,
                artist,
              }))
            }
            getText={(artist) => normalizeArtistDisplayName(artist?.name)}
            getCustomValue={(name) => ({ id: null as number, name })}
            renderInfo={({ id }) => (
              <p className={styles.artistInfo}>
                <Icon isFor="modal.info" />
                {t(
                  id
                    ? "modals.ImportFoldersView.release.artist.info.alreadyPresent"
                    : "modals.ImportFoldersView.release.artist.info.notPresent"
                )}
              </p>
            )}
          />
        </label>
        <label className={cx(formStyles.label, formStyles.vertical)}>
          {t("modals.ImportFoldersView.release.title.label")}
          <input
            className={formStyles.input}
            value={tempData.title}
            onInput={(event) => {
              setTempData((prev) => ({
                ...prev,
                title: (event.target as HTMLInputElement).value,
              }));
            }}
            required
            placeholder={t(
              "modals.ImportFoldersView.release.title.placeholder"
            )}
          />
        </label>
      </div>
      <div className={styles.panel}>
        <label className={cx(formStyles.label, formStyles.vertical)}>
          {t("modals.ImportFoldersView.release.year.label")}
          <input
            className={formStyles.input}
            value={tempData.year}
            onInput={(event) => {
              setTempData((prev) => ({
                ...prev,
                year: +(event.target as HTMLInputElement).value,
              }));
            }}
            required
            type="number"
            placeholder={t("modals.ImportFoldersView.release.year.placeholder")}
          />
        </label>
        <label className={cx(formStyles.label, formStyles.vertical)}>
          {t("modals.ImportFoldersView.release.type.label")}
          <select
            value={tempData.type}
            className={formStyles.select}
            onChange={(event) =>
              setTempData((prev) => ({
                ...prev,
                type: (event.target as HTMLSelectElement).value as ReleaseType,
              }))
            }
          >
            {releaseTypes.map((type) => (
              <option key={type}>{type}</option>
            ))}
          </select>
        </label>
      </div>
      <h3>
        {t("modals.ImportFoldersView.tracklistView.title", {
          total: data.tracks.length,
        })}
      </h3>
      <div className={styles.trackListWrapper}>
        <table className={styles.trackList}>
          <thead>
            <tr>
              <th id="track-position">
                {t("modals.ImportFoldersView.track.position.label")}
              </th>
              <th id="track-title">
                {t("modals.ImportFoldersView.track.title.label")}
              </th>
              <th id="track-trackArtist">
                {t("modals.ImportFoldersView.track.trackArtist.label")}
              </th>
            </tr>
          </thead>
          <tbody>
            {tempData.tracks.map((track, index) => (
              <tr key={index}>
                <TrackView
                  track={track}
                  index={index}
                  onTrackEdit={onTrackEdit}
                />
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className={formStyles.actions}>
        <button
          className={cx(formStyles.button, formStyles.primary)}
          disabled={isImporting}
          autoFocus
        >
          {isImporting ? (
            <Loading size="small" />
          ) : (
            t("modals.ImportFoldersView.actions.import")
          )}
        </button>
        {isImportingMultipleFolders && !isLast && (
          <button
            type="button"
            className={formStyles.button}
            onClick={onSkip}
            disabled={isImporting}
          >
            {t("modals.ImportFoldersView.actions.skip")}
          </button>
        )}
        <button
          type="button"
          className={cx(formStyles.button)}
          onClick={onCancel}
          disabled={isImporting}
        >
          {t("modals.ImportFoldersView.actions.cancel")}
        </button>
      </div>
    </form>
  );
}

type TrackViewProps = {
  track: TrackInfo;
  index: number;
  onTrackEdit: (info: TrackInfo, index: number) => void;
};

function TrackView({ track, index, onTrackEdit }: TrackViewProps) {
  const { t } = useTranslation();
  return (
    <>
      <td>
        <input
          className={cx(formStyles.input, styles.trackInput)}
          defaultValue={track.position}
          readOnly
          required
          type="number"
          placeholder={t(
            "modals.ImportFoldersView.track.position.placeholder",
            { index: index + 1 }
          )}
          aria-labelledby="track-position"
        />
      </td>
      <td>
        <input
          className={cx(formStyles.input, styles.trackInput)}
          value={track.title}
          onInput={(event) =>
            onTrackEdit(
              {
                ...track,
                title: (event.target as HTMLInputElement).value,
              },
              index
            )
          }
          required
          placeholder={t("modals.ImportFoldersView.track.title.placeholder", {
            index: index + 1,
          })}
          aria-labelledby="track-title"
        />
      </td>
      <td>
        <input
          className={cx(formStyles.input, styles.trackInput)}
          value={track.trackArtist}
          onInput={(event) =>
            onTrackEdit(
              {
                ...track,
                trackArtist: (event.target as HTMLInputElement).value,
              },
              index
            )
          }
          required
          placeholder={t(
            "modals.ImportFoldersView.track.trackArtist.placeholder",
            {
              index: index + 1,
            }
          )}
          aria-labelledby="track-trackArtist"
        />
      </td>
    </>
  );
}

type FolderListProps = {
  importStatus: ImportStatus[];
  index: number;
};

function FolderList({ importStatus, index }: FolderListProps) {
  return (
    <ul className={styles.folderList}>
      {importStatus.map(({ folder, isDone }, i) => (
        <li key={folder}>
          <span
            className={cx(
              formStyles.button,
              index === i && formStyles.primary,
              styles.folder
            )}
          >
            {folder}
            {isDone && <Icon isFor="common.checked" className={styles.check} />}
          </span>
        </li>
      ))}
    </ul>
  );
}
