import { useEffect, useRef, type RefObject } from "react";
import { Release, HasId } from "@/types/types";
import useStore from "../store";

type UseReleaseLightboxParams = {
  context: Release[];
};

type UseReleaseLightbox = {
  openLightbox: (selection: HasId[]) => void;
  ref: RefObject<{
    scrollToIndex: (index: number) => void;
  }>;
};

export function useReleaseLightbox({
  context,
}: UseReleaseLightboxParams): UseReleaseLightbox {
  const ref = useRef(null);
  const { setModalContents, lightBoxEntityId } = useStore();

  useEffect(() => {
    if (!context) {
      return;
    }
    const index = context.findIndex((x) => x.id === lightBoxEntityId);
    if (index < 0) {
      return;
    }
    ref.current?.scrollToIndex(index);
  }, [lightBoxEntityId, context]);

  return {
    openLightbox: (selection) =>
      setModalContents({
        name: "lightbox",
        params: {
          id: selection.at(0)?.id,
          context,
        },
      }),
    ref,
  };
}
