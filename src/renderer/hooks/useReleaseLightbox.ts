import { Release, HasId } from "@/types/types";
import useStore from "../store";
import { withPrevent } from "./useKeyboardManager";

type UseReleaseLightboxParams = {
  context: Release[];
};

export function useReleaseLightbox({ context }: UseReleaseLightboxParams) {
  const { setModalContents } = useStore();
  return withPrevent((_event: KeyboardEvent, selection: HasId[]) => {
    setModalContents({
      name: "lightbox",
      params: {
        release: selection[0],
        context,
      },
    });
  });
}
