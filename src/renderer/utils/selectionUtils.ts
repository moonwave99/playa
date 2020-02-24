type Selection = {
  _id: string;
  selected: boolean;
}[];

type selectParams = {
  items: Selection;
  index?: number;
  metaKey?: boolean;
  shiftKey?: boolean;
}

type expandParams = {
  items: Selection;
  direction: number;
  increment: number;
}

export function selectionBounds(items: Selection): [number, number] {
  let lowerBound = -1;
  let upperBound = -1;

  for (let i = 0; i < items.length; i++) {
    if (items[i].selected) {
      lowerBound = i;
      break;
    }
  }

  for (let i = items.length - 1; i > -1; i--) {
    if (items[i].selected) {
      upperBound = i;
      break;
    }
  }

  return [lowerBound, upperBound];
}

export function select({
  items = [],
  index = -1,
  metaKey = false,
  shiftKey = false,
}: selectParams): Selection {
  if (index === -1) {
    return items.map(({ _id }) => ({ _id, selected: false }));
  }
  if (metaKey) {
    return items.map(({ _id, selected }, i) => ({
      _id,
      selected: i === index ? !selected : selected
    }));
  }

  if (shiftKey) {
    const [lowerBound, upperBound] = selectionBounds(items);

    if (index < lowerBound) {
      return items.map(({ _id, selected }, i) => ({
        _id,
        selected: i >= index && i < lowerBound ? true : selected
      }));
    }

    if (index > upperBound) {
      return items.map(({ _id, selected }, i) => ({
        _id,
        selected: i > upperBound && i <= index ? true : selected
      }));
    }

    return items.map(({ _id, selected }, i) => ({
      _id,
      selected: i > lowerBound && i <= index ? true : selected
    }));
  }

  return items.map(({ _id }, i) => ({
    _id,
    selected: i === index
  }));
}

export function scaleSelection({
  items = [],
  direction = 1,
  increment = 1
}: expandParams): Selection {
  const [lowerBound, upperBound] = selectionBounds(items);
  if (direction === 1) {
    const index = Math.min(upperBound + increment, items.length);
    return items.map(({ _id, selected }, i) => ({
        _id,
        selected: increment === 1
          ? i === index || selected
          : i >= lowerBound && i <= index
      })
    );
  } else if (direction === -1) {
    const index = Math.max(lowerBound - increment, 0);
    return items.map(({ _id, selected }, i) => ({
      _id,
      selected: increment === 1
        ? (i === index) || selected
        : i <= upperBound && i >= index
    }));
  }
  return items;
}
