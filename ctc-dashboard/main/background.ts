import path from 'path'
import { app, ipcMain, BrowserWindow } from 'electron'
import serve from 'electron-serve'
import { createVisibleWindow } from './helpers'

import installExtension, { REACT_DEVELOPER_TOOLS } from 'electron-devtools-installer';

// Determine if production or development
const isProd = process.env.NODE_ENV === 'production'


// An app can only have one ipcMain instance, and only one process can have access to the instance.
// The process with ipcMain can listen for events being triggered
function createHiddenWindow () {
  const newWindow = new BrowserWindow({
    show: false,
    webPreferences: {
      // preload: path.join(__dirname, 'hidden_preload.js'),
      nodeIntegration: true,
      contextIsolation: false,
    }
  })

  return newWindow
}

// Setup main memory
let mainMemory = {
  baseLocalDirectory: "Documents",
  pyPath: 'py',
}

// Declare visible and hidden windows
let visibleWindow;
let hiddenWindows: { [key: string]: BrowserWindow | null } = {
  "local": null,
}

// ----- Local file directory processes

// Get local file directory and return to the renderer
ipcMain.on('GET_LOCAL_FILE_DIRECTORY', async (event, arg) => {
  console.log("PROCESS START RECEIVED")
  let backgroundFileUrl = path.join(__dirname, `../background_tasks/GET_LOCAL_FILE_DIRECTORY.html`);

  hiddenWindows["local"] = await createHiddenWindow();
  
  hiddenWindows["local"].loadURL(backgroundFileUrl)

  hiddenWindows["local"].webContents.openDevTools();

  hiddenWindows["local"].on('closed', () => {
    console.log("CLOSED")
		hiddenWindows["local"] = null;
	});
})

// Provide hidden with base local file directory
ipcMain.handle('GET_LOCAL_FILE_DIRECTORY__REQUEST_INPUT', () => {
  return { 
    baseLocalDirectory: mainMemory.baseLocalDirectory,
    pyPath: mainMemory.pyPath 
  }
})

// When receiving directory from hidden, send to renderer
ipcMain.on('GET_LOCAL_FILE_DIRECTORY__SEND_DIRECTORY_TO_MAIN', async (event, arg) => {
  const localFileDirectoryJSON = arg.messages;
  visibleWindow.webContents.send('GET_LOCAL_FILE_DIRECTORY__SEND_DIRECTORY_TO_RENDERER', localFileDirectoryJSON);
});

// ----- Miscellaneous
ipcMain.on('CONSOLE_LOG', async (event, arg) => {
  console.log(arg)
})

// ----- Start electron app
if (isProd) {
  serve({ directory: 'app' })
} else {
  app.setPath('userData', `${app.getPath('userData')} (development)`)
}

// Start visible window
;(async () => {
  await app.whenReady()

  installExtension(REACT_DEVELOPER_TOOLS)
  .then((name) => console.log(`Added Extension:  ${name}`))
  .catch((err) => console.log('An error occurred: ', err));

  // Opens the main visible electron window (not the terminal)
  visibleWindow = createVisibleWindow('main', {
    width: 1000,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      sandbox: false,
    },
  })

  if (isProd) {
    await visibleWindow.loadURL('app://./home')
  } else {
    const port = process.argv[2]
    await visibleWindow.loadURL(`http://localhost:${port}/home`)
    visibleWindow.webContents.openDevTools()
  }
})()

app.on('window-all-closed', () => {
  app.quit()
})