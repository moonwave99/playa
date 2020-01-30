import { configure } from 'enzyme';
import Adapter = require('enzyme-adapter-react-16');
const globalAny: any = global;

globalAny.AudioContext = jest.fn().mockImplementation(() => {
  return {
    decodeAudioData: () => {}
  }
});

globalAny.fetch = require("jest-fetch-mock");
globalAny.fetchMock = globalAny.fetch;

configure({ adapter: new Adapter() });
