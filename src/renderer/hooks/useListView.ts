import type { ListViews } from "@/types/types";
import useStore from "../store";
import { useApiEvents } from "./useApiEvents";

export default function useListView(list: ListViews) {
  const { getListViewMode, toggleListViewMode } = useStore();

  useApiEvents({
    onToggleListViewMode: () => toggleListViewMode(list),
  });

  return getListViewMode(list);
}
