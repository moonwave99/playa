import {
  useState,
  useEffect,
  useLayoutEffect,
  useCallback,
  useRef
} from 'react';

import Mousetrap from 'mousetrap';
import { chunk } from 'lodash';

type ListenerEvent = MouseEvent & {
  target: Element;
};

type HasId = {
  _id: string;
};

type Threshold = {
  width: number;
  columns: number;
};

type OnItemClickParams = {
  _id: string;
  metaKey: boolean;
  shiftKey: boolean;
};

type UseGridParams = {
  items: HasId[];
  thresholds: Threshold[];
  onEnter?: Function;
  onBackspace?: Function;
  onTopOverflow?: Function;
  onBottomOverflow?: Function;
}

type GetRowsParams = {
  items: HasId[];
  thresholds: Threshold[];
  windowWidth: number;
}

function getRows({
  items,
  thresholds,
  windowWidth
}: GetRowsParams): {
  rows: HasId[][];
  threshold: Threshold;
} {
  let threshold = thresholds[thresholds.length - 1];
  for (let i = 0; i < thresholds.length; i++ ) {
    if (windowWidth > thresholds[i].width) {
      threshold = thresholds[i];
      break;
    }
  }
  return {
    rows: chunk(items, threshold.columns),
    threshold
  };
}

function locateSelection({
  items,
  selection,
  rows
}: {
  items: HasId[];
  selection: string[];
  rows: HasId[][];
}): [number, number] {
  if (selection.length === 0 && items.length > 0) {
    return [0, 0];
  }
  let y = 0;
  let x = 0;
  for (let i = 0; i < rows.length; i++) {
    const found = rows[i].map(({ _id }) => _id).indexOf(selection[0]);
    if (found >= 0) {
      x = found;
      y = i;
      break;
    }
  }
  return [x, y];
}

export default function useGrid({
  items = [],
  thresholds,
  onEnter,
  onBackspace,
  onTopOverflow,
  onBottomOverflow
}: UseGridParams): {
  rows: HasId[][];
  selection: string[];
  threshold: Threshold;
  onItemClick: Function;
  grid: (node?: Element | null) => void;
} {
  const [hasFocus, setFocus] = useState(false);
  const [selection, setSelection] = useState([]);
  const [rows, setRows] = useState([] as HasId[][]);
  const [threshold, setThreshold] = useState(thresholds[0]);

  const ref = useRef(null);

  const listener = (event: ListenerEvent): void => {
    if (ref && ref.current) {
      if (!ref.current.contains(event.target)) {
        setFocus(false);
        setSelection([]);
      }
    }
  };

  const setRef = useCallback(node => {
    if (ref.current) {
      document.removeEventListener('click', listener);
    }

    if (node) {
      document.addEventListener('click', listener);
    }

    ref.current = node
  }, [items, listener])

  useLayoutEffect(() => {
    function updateSize(): void {
      const { rows: computedRows, threshold } = getRows({
        items,
        thresholds,
        windowWidth: window.innerWidth
      });
      setRows(computedRows);
      setThreshold(threshold);
    }
    window.addEventListener('resize', updateSize);
    updateSize();
    return (): void => window.removeEventListener('resize', updateSize);
  }, [items]);

  useEffect(() => {
    function onUp(event: KeyboardEvent): void {
      event.preventDefault()
      event.stopPropagation();
      if (!hasFocus) {
        return;
      }
      const [x, y] = locateSelection({ items, rows, selection });
      const newY = Math.max(0, y - 1);
      if (y === newY) {
        onTopOverflow && onTopOverflow(x);
      }
      const index = threshold.columns * newY + x;
      setSelection([items[index]._id]);
    }

    function onDown(event: KeyboardEvent): void {
      event.preventDefault()
      event.stopPropagation();
      if (!hasFocus) {
        return;
      }
      const [x, y] = locateSelection({ items, rows, selection });
      const newY = Math.min(rows.length - 1, y + 1);
      if (y === newY) {
        onBottomOverflow && onBottomOverflow(x);
      }
      const index = Math.min(items.length - 1, threshold.columns * newY + x);
      setSelection([items[index]._id]);
    }

    function onLeft(): void {
      if (!hasFocus) {
        return;
      }
      const [x, y] = locateSelection({ items, rows, selection });
      const newX = (x - 1) % threshold.columns;
      const newY = newX === threshold.columns - 1 ? y - 1 : y;
      const index = Math.max(0, threshold.columns * newY + newX);
      setSelection([items[index]._id]);
    }

    function onRight(): void {
      if (!hasFocus) {
        return;
      }
      const [x, y] = locateSelection({ items, rows, selection });
      const newX = (x + 1) % threshold.columns;
      const newY = newX === 0 ? y + 1 : y;
      const index = Math.min(items.length - 1, threshold.columns * newY + newX);
      setSelection([items[index]._id]);
    }

    function _onEnter(): void {
      if (!hasFocus) {
        return;
      }
      onEnter && onEnter(selection);
    }

    function _onBackspace(): void {
      if (!hasFocus) {
        return;
      }
      onBackspace && onBackspace(selection);
    }

    function onAll(): void {
      if (!hasFocus) {
        return;
      }
      setSelection(items.map(({ _id }) => _id));
    }

    const mousetrap = new Mousetrap();

    mousetrap.bind('up', onUp);
    mousetrap.bind('down', onDown);
    mousetrap.bind('left', onLeft);
    mousetrap.bind('right', onRight);
    mousetrap.bind('enter', _onEnter);
    mousetrap.bind('backspace', _onBackspace);
    mousetrap.bind('command+a', onAll);

    return (): void => {
      mousetrap.unbind(['up', 'down', 'left', 'right', 'enter', 'backspace', 'command+a']);
    };
  }, [items, rows, selection]);

  function onItemClick({ _id }: OnItemClickParams): void {
    setFocus(true);
    setSelection([_id ]);
  }

  return {
    rows,
    selection,
    threshold,
    onItemClick,
    grid: setRef
  };
}
