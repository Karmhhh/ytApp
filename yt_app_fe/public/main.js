// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
const { app, BrowserWindow } = require("electron");
const { exec } = require("child_process");
const path = require("path");

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
    },
  });

  mainWindow.loadURL("yt_app_fe/public/index.html");

  mainWindow.on("closed", function () {
    mainWindow = null;
  });
}

app.on("ready", () => {
  const scriptPath = path.join(__dirname, "yt_dw_App/app.py");
  exec(`venv/Scripts/activate`)
  exec(`fastapi dev ${scriptPath}`, (err, stdout, stderr) => {
    if (err) {
      console.error(`Error starting backend: ${err}`);
      return;
    }
    console.log(`Backend started: ${stdout}`);
  });

  createWindow();
});

app.on("window-all-closed", function () {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", function () {
  if (mainWindow === null) {
    createWindow();
  }
});

/*
const { app, BrowserWindow } = require("electron");
const { exec } = require("child_process");
const path = require("path"); // Importa il modulo path


function createWindow() {
  // Create the browser window.
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
    },
  });

  //load the index.html from a url
  win.loadURL("http://localhost:3000");

  // Avvio del BE
  // Avvia il backend FastAPI come processo separato
  const backendProcess = exec("uvicorn app:app --reload", {
    cwd: path.join(__dirname, "../../yt_dw_App/app"),
  });

  backendProcess.stdout.on("data", (data) => {
    console.log(`stdout: ${data}`);
  });

  backendProcess.stderr.on("data", (data) => {
    console.error(`stderr: ${data}`);
  });

  backendProcess.on("close", (code) => {
    console.log(`Backend process exited with code ${code}`);
  });

  // Open the DevTools.
  win.webContents.openDevTools();
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.

  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
 */
