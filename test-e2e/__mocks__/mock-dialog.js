const electron = require('electron');
const path = require('path');

function fake(options) {
  options.forEach(option => {
    if (electron.dialog[option.method]) {
      electron.dialog[option.method] = option.method.toLowerCase().endsWith('sync')
        ? () => option.value
        : async () => option.value
    } else {
      throw new Error(`can't find ${option.method} on dialog module.`)
    }
  })
}

electron.ipcMain.on('SPECTRON_FAKE_DIALOG/SEND', (event, options) => {
  fake(options);
  event.returnValue = true;
});
