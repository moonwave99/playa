import { app, BrowserWindow, shell, screen } from "electron";
import path from "node:path";
import started from "electron-squirrel-startup";
import { init } from "./controllers/init";

if (started) {
  app.quit();
}

async function createWindow() {
  const { height, width } = screen.getPrimaryDisplay().size;
  const mainWindow = new BrowserWindow({
    height,
    width,
    minWidth: 450,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: true,
    },
    titleBarStyle: "hidden",
    trafficLightPosition: { x: 10, y: 20 },
  });

  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`)
    );
  }

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });

  await init(mainWindow);
}

app.on("ready", createWindow);
app.on("window-all-closed", () => app.quit());
app.on("activate", () => {
  if (!BrowserWindow.getAllWindows().length) {
    createWindow();
  }
});
