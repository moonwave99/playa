import React = require('react');
import { configure } from 'enzyme';
import Adapter = require('enzyme-adapter-react-16');
import initI18n from '../src/renderer/initializers/initI18n';

React.useLayoutEffect = React.useEffect ;

const globalAny: any = global;

globalAny.AudioContext = jest.fn().mockImplementation(() => ({
  decodeAudioData: () => {}
}));

globalAny.fetch = require("jest-fetch-mock");
globalAny.fetchMock = globalAny.fetch;

globalAny.IntersectionObserver = jest.fn(() => ({
  observe: jest.fn(),
  unobserve: jest.fn()
}));

configure({ adapter: new Adapter() });

initI18n();
