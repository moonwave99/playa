import { createRoot } from "react-dom/client";
import { HashRouter as Router } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { Settings } from "@/types/types.ts";
import { DEFAULT_SETTINGS } from "@/constants.ts";
import { KeyManagerProvider } from "./hooks/useKeyboardManager.ts";
import api from "./api.ts";
import Layout from "./Layout.tsx";

import "./i18n.ts";

import "./index.css";

const queryClient = new QueryClient();

async function run() {
  let initialSettings: Settings;
  try {
    initialSettings = await api.settings.getSettings();
  } catch {
    initialSettings = DEFAULT_SETTINGS;
  }
  createRoot(document.getElementById("root")).render(
    <QueryClientProvider client={queryClient}>
      <Router>
        <KeyManagerProvider>
          <Layout initialSettings={initialSettings} />
        </KeyManagerProvider>
      </Router>
    </QueryClientProvider>
  );
}

run();
