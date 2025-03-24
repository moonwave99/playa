import settings from 'electron-settings';
import { isEmpty } from '@/lib/utils';

export async function initSettings() {
  let currentSettings = await settings.get();
  if (isEmpty(currentSettings)) {
    const defaultSettings = await import('../../settings.json');
    currentSettings = defaultSettings.default;
    await settings.set(currentSettings);
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
  return settings.get();
}

export function setSettings(newSettings: Record<string, string | number | boolean>) {
  return settings.set(newSettings);
}