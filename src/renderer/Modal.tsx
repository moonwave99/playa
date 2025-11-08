import ReactModal from "react-modal";
import { useTranslation } from "react-i18next";
import useStore from "./store";
import { useEffect, useState, type JSX, CSSProperties } from "react";

import api from "./api";
import { MODAL_CLOSE_TIMEOUT } from "@/constants";

import ReleaseLightbox from "./components/ReleaseLightbox";
import EditArtistView from "./components/EditArtistView/EditArtistView";
import EditReleaseView from "./components/EditReleaseView/EditReleaseView";
import EditCollectionView from "./components/EditCollectionView";
import GroupReleasesView from "./components/GroupReleasesView";
import SettingsView from "./components/SettingsView";
import EditGroupView from "./components/EditGroupView";
import SearchView from "./components/SearchView";
import ImportDataView from "./components/ImportDataView";
import ExportDataView from "./components/ExportDataView";
import AddReleasesToCollectionView from "./components/AddReleasesToCollectionView";
import AddArtistsToGroupView from "./components/AddArtistsToGroupView";
import ImportFoldersView from "./components/ImportFoldersView";
import StatsView from "./components/StatsView";
import MissingReleaseFolder from "./components/MissingReleaseFolder";
import MissingArtistFolder from "./components/MissingArtistFolder";
import { Icon } from "./icons";

import buttonStyles from "./buttons.module.css";

type ModalProps = {
  setContext: (context: string) => void;
};

export default function Modal({ setContext }: ModalProps) {
  const { t } = useTranslation();
  const [isModalOpen, setModalOpen] = useState(false);
  const { modalContents, setModalContents, isModalFixed } = useStore();

  useEffect(() => {
    const isModalOpen = !!modalContents;
    api.state.setModalOpen(isModalOpen);
    setModalOpen(isModalOpen);
  }, [modalContents]);

  function closeModal() {
    setModalOpen(false);
  }

  function clearModalContents() {
    setModalContents(null);
  }

  function getModalContents() {
    if (!modalContents) {
      return null;
    }
    const { name, params } = modalContents;
    const Component = modalMap[name].component as ({
      closeModal,
    }: {
      closeModal: () => void;
    }) => JSX.Element;
    return <Component {...{ closeModal, ...params }} />;
  }

  return (
    <ReactModal
      isOpen={isModalOpen}
      shouldCloseOnEsc={!isModalFixed}
      shouldCloseOnOverlayClick={!isModalFixed}
      closeTimeoutMS={MODAL_CLOSE_TIMEOUT}
      onRequestClose={closeModal}
      style={getModalStyle(modalContents?.name)}
      onAfterOpen={() => {
        api.state.setInputFocused(true);
        setContext("modal");
      }}
      onAfterClose={() => {
        api.state.setInputFocused(false);
        setContext("list");
        clearModalContents();
      }}
    >
      <button
        disabled={isModalFixed}
        onClick={closeModal}
        className={buttonStyles.button}
        aria-label={t("modals.common.actions.close")}
        style={{
          position: "absolute",
          top: "0.5rem",
          right: "0.5rem",
          zIndex: 1,
        }}
      >
        <Icon isFor="modal.close" />
      </button>
      {getModalContents()}
    </ReactModal>
  );
}

function getModalStyle(name: Modals) {
  return {
    overlay: {
      background: "rgba(100,100,100, 0.1)",
      backdropFilter: "blur(3px)",
      zIndex: 2,
    },
    content: {
      background: "black",
      width: "max(40vw, 600px)",
      height: "min-content",
      margin: "auto",
      borderColor: "var(--modal-border-color)",
      borderRadius: ".5rem",
      padding: name === "lightbox" ? 0 : "1.5rem",
      overflow: "initial",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      ...((modalMap[name] as { styles?: CSSProperties })?.styles || {}),
    },
  };
}

const modalMap = {
  settings: {
    component: SettingsView,
  },
  importData: {
    component: ImportDataView,
    styles: {
      width: "min(80vw, 600px)",
    },
  },
  exportData: {
    component: ExportDataView,
  },
  groupReleases: {
    component: GroupReleasesView,
  },
  editRelease: {
    component: EditReleaseView,
  },
  editArtist: {
    component: EditArtistView,
  },
  editCollection: {
    component: EditCollectionView,
    styles: {
      width: "min(90vw, 1000px)",
    },
  },
  editGroup: {
    component: EditGroupView,
    styles: {
      width: "min(90vw, 1000px)",
    },
  },
  addReleasesToCollection: {
    component: AddReleasesToCollectionView,
  },
  addArtistsToGroup: {
    component: AddArtistsToGroupView,
  },
  importFolders: {
    component: ImportFoldersView,
    styles: {
      width: "min(90vw, 1000px)",
      padding: 0,
    },
  },
  search: {
    component: SearchView,
    styles: {
      width: "min(90vw, 1400px)",
      marginTop: "0",
    },
  },
  stats: {
    component: StatsView,
    styles: {
      width: "min(80vw, 1000px)",
    },
  },
  lightbox: {
    component: ReleaseLightbox,
    styles: {
      width: "auto",
      overflow: "visible",
      border: "none",
      background: "transparent",
    },
  },
  missingReleaseFolder: {
    component: MissingReleaseFolder,
    styles: {
      width: "min(90vw, 700px)",
    },
  },
  missingArtistFolder: {
    component: MissingArtistFolder,
  },
};

export type Modals = keyof typeof modalMap;
