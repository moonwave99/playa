import { useState, useRef, type RefObject } from "react";
import { useNavigationType } from "react-router";
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
  const navigationType = useNavigationType();
  const ref = useRef(null);

  const [scrollInfo, setScrollInfo] = useState<ScrollInfo>(
    navigationType !== "POP" ? null : cache[key?.join("-")] || null
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
