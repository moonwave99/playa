import { findDOMNode } from 'react-dom';

type ScrollToParams = {
  selector: string;
  block?: ScrollLogicalPosition;
  behavior?: ScrollBehavior;
}

export default function ScrollToParams({
  selector,
  block,
  behavior
}: ScrollToParams): void {
  const target = findDOMNode(document.querySelector(selector)) as HTMLElement;
  if (!target) {
    return;
  }
  setImmediate(() => {
    target.scrollIntoView({ block, behavior });
  });
}
