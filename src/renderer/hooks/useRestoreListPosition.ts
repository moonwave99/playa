import { useState, useRef, type RefObject } from "react";
import { useLocation } from "react-router";
import type { ScrollInfo } from "../components/List";

type UseRestoreListPositionParams = {
  key: unknown[];
};

type UseRestoreListPosition = {
  scrollInfo: ScrollInfo;
  storeScrollInfo: (scrollInfo: ScrollInfo) => void;
  ref: RefObject<{
    scrollToIndex: (index: number) => void;
  }>;
};

const cache: Record<string, ScrollInfo> = {};

export default function useRestoreListPosition({
  key,
}: UseRestoreListPositionParams): UseRestoreListPosition {
  const ref = useRef(null);
  const location = useLocation();

  const [scrollInfo, setScrollInfo] = useState<ScrollInfo>(
    location.state?.direction !== -1 ? null : cache[key?.join("-")] || null
  );

  function storeScrollInfo(scrollInfo: ScrollInfo) {
    cache[key?.join("-")] = scrollInfo;
    setScrollInfo(scrollInfo);
  }

  return {
    scrollInfo,
    storeScrollInfo,
    ref,
  };
}
