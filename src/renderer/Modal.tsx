import ReactModal from "react-modal";
import useStore from "./store";
import { useEffect, useState } from "react";
import {
  ReleaseWithArtist,
  ReleaseWithArtistAndSubReleases,
  ArtistWithReleases,
  HasId,
  ImportData,
} from "@/types/types";
import api from "./api";

import ReleaseLightbox from "./components/ReleaseLightbox";
import EditArtistView from "./components/EditArtistView";
import EditReleaseView from "./components/EditReleaseView";
import EditCollectionView from "./components/EditCollectionView";
import GroupReleasesView from "./components/GroupReleasesView";
import SettingsView from "./components/SettingsView";
import EditGroupView from "./components/EditGroupView";
import SearchView from "./components/SearchView";
import ImportDataView from "./components/ImportDataView";
import ExportDataView from "./components/ExportDataView";
import ImportFoldersView from "./components/ImportFoldersView";
import AddReleasesToCollectionView from "./components/AddReleasesToCollectionView";
import AddArtistsToGroupView from "./components/AddArtistsToGroupView";
import InteractiveImportView from "./components/InteractiveImportView";
import StatsView from "./components/StatsView";

function getModalOverrides(name: Modals) {
  if (name === "lightbox") {
    return {
      width: "auto",
      overflow: "visible",
      border: "none",
      background: "transparent",
    };
  }
  if (name === "search") {
    return {
      width: "min(90vw, 1400px)",
      marginTop: "0",
    };
  }
  if (name === "interactiveImport") {
    return {
      width: "min(90vw, 1000px)",
      padding: 0,
    };
  }
  if (name === "editCollection" || name === "editGroup") {
    return {
      width: "min(90vw, 1000px)",
    };
  }
  if (name === "importData") {
    return {
      width: "min(80vw, 600px)",
    };
  }
  if (name === "importFolders") {
    return {
      width: "min(80vw, 1000px)",
    };
  }
  if (name === "stats") {
    return {
      width: "min(80vw, 1000px)",
    };
  }
  return {};
}

function getModalStyle(name: Modals) {
  const modalStyle = {
    overlay: {
      background: "rgba(100,100,100, 0.1)",
      backdropFilter: "blur(3px)",
      zIndex: 2,
    },
    content: {
      background: "black",
      width: "max(40vw, 600px)",
      height: "min-content",
      maxHeight: "95vh",
      margin: "auto",
      borderColor: "var(--modal-border-color)",
      borderRadius: ".5rem",
      padding: name === "lightbox" ? 0 : "1.5rem",
      overflow: "initial",
      ...getModalOverrides(name),
    },
  };
  return modalStyle;
}

ReactModal.setAppElement("#root");

type ModalProps = {
  setContext: (context: string) => void;
};

export type Modals =
  | "settings"
  | "importData"
  | "exportData"
  | "importFolders"
  | "groupReleases"
  | "editRelease"
  | "editArtist"
  | "editCollection"
  | "editGroup"
  | "addReleasesToCollection"
  | "addArtistsToGroup"
  | "interactiveImport"
  | "search"
  | "stats"
  | "lightbox";

export default function Modal({ setContext }: ModalProps) {
  const [isModalOpen, setModalOpen] = useState(false);
  const { modalContents, setModalContents, isModalFixed } = useStore();

  useEffect(() => {
    setModalOpen(!!modalContents);
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

    if (name === "settings") {
      return <SettingsView onSave={closeModal} onCancel={closeModal} />;
    }
    if (name === "importData") {
      return <ImportDataView onDone={closeModal} onCancel={closeModal} />;
    }
    if (name === "exportData") {
      return <ExportDataView onDone={closeModal} />;
    }
    if (name === "importFolders") {
      return <ImportFoldersView onDone={closeModal} />;
    }
    if (name === "groupReleases") {
      return (
        <GroupReleasesView
          releases={params.releases as ReleaseWithArtist[]}
          onSave={closeModal}
          onCancel={closeModal}
        />
      );
    }
    if (name === "editRelease") {
      return (
        <EditReleaseView
          release={params.release as ReleaseWithArtistAndSubReleases}
          onSave={closeModal}
          onCancel={closeModal}
        />
      );
    }
    if (name === "editArtist") {
      return (
        <EditArtistView
          artist={params.artist as ArtistWithReleases}
          onSave={closeModal}
          onCancel={closeModal}
        />
      );
    }
    if (name === "editCollection") {
      return (
        <EditCollectionView
          id={(params.collection as HasId).id}
          onSave={closeModal}
          onCancel={closeModal}
        />
      );
    }
    if (name === "editGroup") {
      return (
        <EditGroupView
          id={(params.group as HasId).id}
          onSave={closeModal}
          onCancel={closeModal}
        />
      );
    }
    if (name === "addReleasesToCollection") {
      return (
        <AddReleasesToCollectionView
          releases={params.releases as ReleaseWithArtist[]}
          onSave={closeModal}
          onCancel={closeModal}
        />
      );
    }
    if (name === "addArtistsToGroup") {
      return (
        <AddArtistsToGroupView
          artists={params.artists as ArtistWithReleases[]}
          onSave={closeModal}
          onCancel={closeModal}
        />
      );
    }
    if (name === "interactiveImport") {
      return (
        <InteractiveImportView
          onCancel={closeModal}
          onDone={closeModal}
          data={params.data as ImportData[]}
        />
      );
    }
    if (name === "search") {
      return <SearchView onClose={closeModal} />;
    }
    if (name === "stats") {
      return <StatsView onClose={closeModal} />;
    }
    if (name === "lightbox") {
      return (
        <ReleaseLightbox
          onClose={closeModal}
          id={(params.release as HasId).id}
          context={params.context as ReleaseWithArtist[]}
          hideSidebar={!!params.hideSidebar}
        />
      );
    }
  }

  return (
    <ReactModal
      isOpen={isModalOpen}
      shouldCloseOnEsc={!isModalFixed}
      shouldCloseOnOverlayClick={!isModalFixed}
      closeTimeoutMS={300}
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
      {getModalContents()}
    </ReactModal>
  );
}
