import { shell } from 'electron';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import WebFont from 'webfontloader';
import initI18n from './initializers/initI18n';
import { AboutView } from './components/AboutView/AboutView'

import {
  name,
  description,
  version,
  homepage,
  repository
} from '../../package.json';
import { FONTS } from '../constants';

window.addEventListener('load', async () => {
  WebFont.load({ custom: { families: FONTS } });
  initI18n();

  function onLinkClick(url: string): void {
    shell.openExternal(url);
  }

  ReactDOM.render(
    <AboutView
      name={name}
      description={description}
      version={version}
      homepage={homepage}
      repository={repository}
      tos={`${homepage}/terms-of-service`}
      onLinkClick={onLinkClick}/>,
    document.getElementById('about')
  );
});
