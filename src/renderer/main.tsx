import { createRoot } from "react-dom/client";
import { HashRouter as Router } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { KeyManagerProvider } from "./hooks/useKeyboardManager.ts";
import Layout from "./Layout.tsx";

import "./i18n.ts";

import "./index.css";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")).render(
  <QueryClientProvider client={queryClient}>
    <Router>
      <KeyManagerProvider>
        <Layout />
      </KeyManagerProvider>
    </Router>
  </QueryClientProvider>
);
