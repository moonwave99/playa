import { useState, useEffect, useRef } from 'react';
import mousetrap from 'mousetrap';

export type SelectionItem = {
  index: number;
  selected: boolean;
};

type OnItemClickParams = {
  index: number;
  metaKey: boolean;
  shiftKey: boolean;
};

function select({
  selection = [] as SelectionItem[],
  index = -1,
  lastClickedIndex = -1,
  metaKey = false,
  shiftKey = false
}): SelectionItem[] {
  let newSelection = selection;
  // reset existing selection
  if (!metaKey && !shiftKey) {
    newSelection = newSelection.map(({ index }) => ({
      index,
      selected: false
    }));
  }

  if (shiftKey) {
    const [start, end] = [
      Math.min(index, lastClickedIndex),
      Math.max(index, lastClickedIndex)
    ];
    return newSelection.map(({ index, selected }) => ({
      index,
      selected: (index >= start && index <= end) || selected
    }));
  }

  return newSelection.map(({ index: i, selected }) => {
    return {
      index: i,
      selected: i === index ? !selected : selected
    };
  });
}

type UseSelectParams<T> = {
  items: Array<T>;
  onEnter?: Function;
}

export default function useSelect<T>({
  items = [],
  onEnter
}: UseSelectParams<T>): {
  onItemClick: Function;
  selection: SelectionItem[];
  direction: number;
} {
  const [selection, setSelection] = useState(
    items.map((_item, index) => ({
      index,
      selected: false
    }))
  );
  const lastClickedIndex = useRef(-1);
  const direction = useRef(0);

  useEffect(() => {
    setSelection(items.map((_item, index) => ({
      index,
      selected: false
    })));
  }, [items])

  function onItemClick({ index, metaKey, shiftKey }: OnItemClickParams): void {
    const newSelection = select({
      selection,
      index,
      lastClickedIndex: lastClickedIndex.current,
      metaKey,
      shiftKey
    });
    if (!metaKey && !shiftKey) {
      direction.current = 0;
    } else {
      direction.current = index > lastClickedIndex.current ? 1 : -1;
    }
    lastClickedIndex.current = index;
    setSelection(newSelection);
  }

  useEffect(() => {
    function onUp(): void {
      const index = Math.max(lastClickedIndex.current - 1, 0);
      const newSelection = select({
        selection,
        index
      });
      direction.current = -1;
      lastClickedIndex.current = index;
      setSelection(newSelection);
    }

    function onDown(): void {
      const index = Math.min(lastClickedIndex.current + 1, items.length - 1);
      const newSelection = select({
        selection,
        index
      });
      direction.current = 1;
      lastClickedIndex.current = index;
      setSelection(newSelection);
    }

    function _onEnter(): void {
      onEnter && onEnter(
        selection
          .filter(({ selected }) => selected)
          .map(({ index }) => index)
      );
    }

    mousetrap.bind('up', onUp);
    mousetrap.bind('down', onDown);
    mousetrap.bind('enter', _onEnter);
    return (): void => { mousetrap.unbind(['up', 'down', 'enter']) };
  }, [items.length, selection]);

  return {
    onItemClick,
    selection,
    direction: direction.current
  };
}
