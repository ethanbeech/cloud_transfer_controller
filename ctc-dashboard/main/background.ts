import path from 'path'
import { app, ipcMain, BrowserWindow, session } from 'electron'
import serve from 'electron-serve'
import { createVisibleWindow } from './helpers'

import installExtension, { REACT_DEVELOPER_TOOLS } from 'electron-extension-installer';

// Determine if production or development
const isProd = process.env.NODE_ENV === 'production'
const addDevTools = true;


// An app can only have one ipcMain instance, and only one process can have access to the instance.
// The process with ipcMain can listen for events being triggered
function createHiddenWindow () {
  const newWindow = new BrowserWindow({
    show: true,
    webPreferences: {
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
  console.log("PROCESS START RECEIVED: GET LOCAL FILE DIRECTORY")
  // TODO: Add check to ensure no current process on local
  let backgroundFileUrl = path.join(__dirname, `../background_tasks/GET_LOCAL_FILE_DIRECTORY.html`);

  hiddenWindows["local"] = await createHiddenWindow();
  
  hiddenWindows["local"].loadURL(backgroundFileUrl)

  hiddenWindows["local"].webContents.openDevTools();

  hiddenWindows["local"].on('closed', () => {
    console.log("CLOSED PROCESS: GET LOCAL FILE DIRECTORY")
		hiddenWindows["local"] = null;
	});
})

// Get google file directory and return to the renderer
ipcMain.on('GET_GOOGLE_FILE_DIRECTORY', async (event, arg) => {
  console.log("PROCESS START RECEIVED: GET GOOGLE FILE DIRECTORY")
  // TODO: Add check to ensure no current process on local
  let backgroundFileUrl = path.join(__dirname, `../background_tasks/GET_GOOGLE_FILE_DIRECTORY.html`);

  hiddenWindows["google"] = await createHiddenWindow();
  
  hiddenWindows["google"].loadURL(backgroundFileUrl)

  hiddenWindows["google"].webContents.openDevTools();

  hiddenWindows["google"].on('closed', () => {
    console.log("CLOSED PROCESS: GET GOOGLE FILE DIRECTORY")
		hiddenWindows["google"] = null;
	});
})

ipcMain.on('GET_CLOUD_CONNECTION_STATUSES', async () => {
  console.log("PROCESS START RECEIVED: GET CLOUD CONNECTION STATUSES");
  // TODO: Add check to ensure no current process on google
  let backgroundFileUrl = path.join(__dirname, '../background_tasks/GET_CLOUD_CONNECTION_STATUSES.html');

  hiddenWindows['google'] = await createHiddenWindow();
  hiddenWindows['google'].loadURL(backgroundFileUrl);
  hiddenWindows['google'].webContents.openDevTools();

  hiddenWindows['google'].on('closed', () => {
    console.log('CLOSED PROCESS: GET CLOUD CONNECTION STATUSES');
    hiddenWindows['google'] = null;
  });
}),

// Provide hidden with base local file directory
ipcMain.handle('GET_LOCAL_FILE_DIRECTORY__REQUEST_INPUT', () => {
  return { 
    baseLocalDirectory: mainMemory.baseLocalDirectory,
    pyPath: mainMemory.pyPath 
  }
})

// When receiving directory from hidden, send to renderer
ipcMain.on('GET_FILE_DIRECTORY__SEND_DIRECTORY_TO_MAIN', async (event, args) => {
  const status = args.status;
  const cloudService = args.cloudService;
  const fileDirectoryJSON = args.results;
  console.log(args)
  console.log(fileDirectoryJSON)
  visibleWindow.webContents.send('GET_FILE_DIRECTORY__SEND_DIRECTORY_TO_RENDERER', status, cloudService, fileDirectoryJSON);
});

// When receiving connection results from hidden, send to renderer
ipcMain.on('HOMEPAGE_CLOUD_AUTH__SEND_CONNECTION_RESULT_TO_MAIN', async (event, args) => {
  const cloudService = args.cloudService;
  const connectionStatus = args.connectionResult;
  visibleWindow.webContents.send('HOMEPAGE_CLOUD_AUTH__SEND_CONNECTION_RESULT_TO_RENDERER', cloudService, connectionStatus)
})

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

  if (!isProd && addDevTools) {
  await installExtension(REACT_DEVELOPER_TOOLS, {
    loadExtensionOptions: {
      allowFileAccess: true,
    },
  })
  .then((name) => console.log(`Added Extension:  ${name}`))
  .catch((err) => console.log('An error occurred: ', err));
  }
  
  // Opens the main visible electron window (not the terminal)
  visibleWindow = createVisibleWindow('main', {
    width: 1000,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
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