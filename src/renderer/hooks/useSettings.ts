import { useState, useEffect } from 'react';
import type { Settings } from '@/types/types';

type UseSettings = {
  settings: Settings;
  saveSettings: (newSettings: Settings) => Promise<void>;
}

export default function useSettings(): UseSettings {
  const [settings, setSettings] = useState<Settings>({});

  useEffect(() => {
    window.api.settings.getSettings().then((newSettings: Settings) => setSettings(newSettings))
  }, []);

  async function saveSettings(newSettings: Settings) {
    return await window.api.settings.setSettings(newSettings);
  }

  return {
    settings,
    saveSettings
  }
}