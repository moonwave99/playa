import ReactModal from "react-modal";
import useStore from "./store";
import { useEffect, useState } from "react";
import {
  ReleaseWithArtist,
  ReleaseWithArtistAndSubReleases,
  ArtistWithReleases,
  Release,
} from "@/types/types";
import api from "./api";
import CoverLightbox from "./components/CoverLightbox";
import EditArtistView from "./components/EditArtistView";
import EditReleaseView from "./components/EditReleaseView";
import GroupReleasesView from "./components/GroupReleasesView";
import ImportDataView from "./components/ImportDataView";
import SettingsView from "./components/SettingsView";
import StatsView from "./components/StatsView";

function getModalOverrides(name: string) {
  if (name === "lightbox") {
    return {
      width: "calc(400px + var(--cover-lightbox-size))",
      height: "var(--cover-lightbox-size)",
      overflow: "visible",
      border: "none",
      background: "transparent",
    };
  }
  if (name === "stats") {
    return {
      width: "min(90vw, 1000px)",
    };
  }
  if (name === "importData") {
    return {
      width: "min(80vw, 600px)",
    };
  }
  return {};
}

function getModalStyle(name: string) {
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
      borderColor: "var(--tertiary-color)",
      borderRadius: ".5rem",
      padding: name === "lightbox" ? 0 : "1.5rem",
      ...getModalOverrides(name),
    },
  };
  return modalStyle;
}

ReactModal.setAppElement("#root");

type ModalProps = {
  setContext: (context: string) => void;
};

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

    if (name === "stats") {
      return <StatsView onClose={closeModal} />;
    }
    if (name === "settings") {
      return <SettingsView onSave={closeModal} onCancel={closeModal} />;
    }
    if (name === "importData") {
      return <ImportDataView onDone={closeModal} onCancel={closeModal} />;
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
    if (name === "lightbox") {
      return (
        <CoverLightbox
          onClose={closeModal}
          id={(params.release as Release).id}
          context={params.context as ReleaseWithArtist[]}
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
