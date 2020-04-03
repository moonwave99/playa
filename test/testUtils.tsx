import { flow } from 'lodash';
import React, { ReactElement } from 'react';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { MemoryRouter } from 'react-router-dom';
import { DndProvider } from 'react-dnd';
import Backend from 'react-dnd-test-backend';
import { shallow, render, mount } from 'enzyme';
export { shallow, render, mount } from 'enzyme';

const rendererMap: { [key: string] : Function} = {
  'shallow': shallow,
  'render': render,
  'mount': mount
};

export enum Renderers {
  shallow = 'shallow',
  render = 'render',
  mount = 'mount',
}

export enum Wrappers {
  Router = 'Router',
  Provider = 'Provider',
  DndProvider = 'DndProvider'
}

const defaultStore = {};

const routerWrapper = function(element: ReactElement) {
  return <MemoryRouter>{element}</MemoryRouter>;
}

const providerWrapper = function(element: ReactElement, store: object = defaultStore) {
  const mockedStore = configureMockStore([thunk])(store);
  return <Provider store={mockedStore}>{element}</Provider>;
}

const dndProviderWrapper = function(element: ReactElement) {
  return <DndProvider backend={Backend}>{element}</DndProvider>;
}

const wrapperMap: { [key: string] : (...args: any[]) => any} = {
  'Router': routerWrapper,
  'Provider': providerWrapper,
  'DndProvider': dndProviderWrapper
};

export function wrap(renderer: Renderers, ...wrappers: Wrappers[]): Function {
  return (...args: any[]) => rendererMap[renderer](flow(
    wrappers.map(w => wrapperMap[w])
  )(...args));
}

export const shallowInRouter =
  (element: ReactElement) => wrap(Renderers.shallow, Wrappers.Router)(element);
export const renderInRouter =
  (element: ReactElement) => wrap(Renderers.render, Wrappers.Router)(element);
export const mountInRouter =
  (element: ReactElement) => wrap(Renderers.mount, Wrappers.Router)(element);

export const shallowInProvider =
  (element: ReactElement, store: any = {}) => wrap(Renderers.shallow, Wrappers.Provider)(element, store);
export const renderInProvider =
  (element: ReactElement, store: any = {}) => wrap(Renderers.render, Wrappers.Provider)(element, store);
export const mountInProvider =
  (element: ReactElement, store: any = {}) => wrap(Renderers.mount, Wrappers.Provider)(element, store);

export const shallowInDnDProvider =
  (element: ReactElement) => wrap(Renderers.shallow, Wrappers.DndProvider)(element);
export const renderInDnDProvider =
  (element: ReactElement) => wrap(Renderers.render, Wrappers.DndProvider)(element);
export const mountInDnDProvider =
  (element: ReactElement) => wrap(Renderers.mount, Wrappers.DndProvider)(element);

export const shallowInAll = wrap(
  Renderers.shallow,
  Wrappers.Provider,
  Wrappers.Router,
  Wrappers.DndProvider
);

export const renderInAll = wrap(
  Renderers.render,
  Wrappers.Provider,
  Wrappers.Router,
  Wrappers.DndProvider
);

export const mountInAll = wrap(
  Renderers.mount,
  Wrappers.Provider,
  Wrappers.Router,
  Wrappers.DndProvider
);

type MockRouterParams = {
  routeParams?: object;
  routeMatch?: { url: string };
  location?: {
    pathname: string;
    search: string;
  }
}

export const mockRouter = function({
  routeParams = { _id: '1' },
  routeMatch = { url: '/'},
  location = {
    pathname: '/',
    search: ''
  }
}: MockRouterParams) {
  jest.mock('react-router', () => ({
    ...jest.requireActual('react-router'),
    useParams: () => routeParams,
    useRouteMatch: () => routeMatch,
    useLocation: () => location
  }));
}

const keyMap: {
  [key: string]: number
} = {
  Backspace: 8,
  Enter: 13,
  Escape: 27,
  Left: 37,
  Up: 38,
  Right: 39,
  Down: 40,
  a: 65
};

export const simulateKey = ({
  eventType = 'keydown',
  key,
  metaKey = false,
  shiftKey = false
}: {
  eventType: 'keydown'|'keypress';
  key: string;
  metaKey?: boolean;
  shiftKey?: boolean;
}): void => {
  const event = new KeyboardEvent(eventType, {
    which: keyMap[key],
    metaKey,
    shiftKey,
    target: document.querySelector('.ReactModalPortal')
  } as KeyboardEventInit);
  document.dispatchEvent(event);
}

export const simulateClick = (selector: string) => {
  const clickEvent = document.createEvent('MouseEvents');
  clickEvent.initMouseEvent('click', true, true, window, 1, 0, 0, 0, 0,
      false, false, false, false, 0, null);

  const element = document.querySelector(selector);
  element && element.dispatchEvent(clickEvent);
}
