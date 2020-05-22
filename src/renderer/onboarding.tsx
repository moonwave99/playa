import { ipcRenderer as ipc } from 'electron';
import React from 'react';
import * as ReactDOM from 'react-dom';
import WebFont from 'webfontloader';
import initI18n from './initializers/initI18n';
import { OnboardingView } from './components/OnboardingView/OnboardingView'

import { FONTS, IPC_MESSAGES } from '../constants';

const {
  IPC_ONBOARDING_CLOSE_WINDOW
} = IPC_MESSAGES;

window.addEventListener('load', async () => {
  WebFont.load({ custom: { families: FONTS } });
  initI18n();

  function closeWindow(): void {
    ipc.send(IPC_ONBOARDING_CLOSE_WINDOW);
  }

  document.addEventListener('keydown', (event: KeyboardEvent) => {
    switch (event.code) {
      case 'Escape':
        closeWindow();
        break;
    }
  });

  ReactDOM.render(
    <OnboardingView onDismiss={closeWindow}/>,
    document.getElementById('onboarding')
  );
});
