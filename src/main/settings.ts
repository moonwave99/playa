import settings from 'electron-settings';
import { isEmpty } from '@/lib/utils';
import { readJSONSync } from 'fs-extra';

export function initSettings() {
  let currentSettings = settings.getSync();
  if (isEmpty(currentSettings)) {
    currentSettings = readJSONSync('../../settings.json');
    settings.setSync(currentSettings);
  }
  console.log('Settings loaded:', currentSettings);
}

export function getSetting(key: string) {
  const value = settings.getSync(key);
  if (!value) {
    throw new Error(`Cannot find ${key} in settings`);
  }
  return value;
}

export function getSettings() {
  return settings.getSync();
}

export function setSettings(newSettings: Record<string, string | number | boolean>) {
  return settings.setSync(newSettings);
}