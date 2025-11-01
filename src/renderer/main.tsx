import { createRoot } from "react-dom/client";
import { HashRouter as Router } from "react-router";
import ReactModal from "react-modal";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { Settings } from "@/types/types.ts";
import { DEFAULT_SETTINGS } from "@/constants.ts";
import { KeyManagerProvider } from "./hooks/useKeyboardManager.ts";
import api from "./api.ts";
import { ErrorBoundary } from "react-error-boundary";
import ErrorPage from "./pages/ErrorPage.tsx";
import Layout from "./Layout.tsx";

ReactModal.setAppElement("#root");

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
    <ErrorBoundary fallback={<ErrorPage />}>
      <QueryClientProvider client={queryClient}>
        <Router>
          <KeyManagerProvider>
            <Layout initialSettings={initialSettings} />
          </KeyManagerProvider>
        </Router>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

run();
