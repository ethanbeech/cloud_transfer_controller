const { contextBridge, ipcRenderer } = require('electron')

// Define tree classes
class FileNode {
  file_id: string;
  current_path: string;
  file_title: string;
  file_extension: string | null;
  children: FileNode[];

  constructor(constructor_values: Record<string, any> | { file_id: string, file_title: string, file_extension: string | null }) {
    this.file_id = constructor_values.file_id;
    this.current_path = constructor_values.file_id;
    this.file_title = constructor_values.file_title;
    this.file_extension = constructor_values.file_extension;

    if ('children' in constructor_values) {
      this.children = constructor_values.children;
    } else if (this.isValuesNotJSON(constructor_values)) {
      this.children = []
    } else {
      console.log("SUCCESS")
      // @ts-ignore
      this.children = constructor_values.children.map((child_json) => new FileNode(child_json))
    }
  }

  add_child(child: FileNode) {
    this.children.push(child);
  }

  create_child(file_id: string, file_title: string, file_extension: string | null) {
    this.children.push(new FileNode({ file_id, file_title, file_extension }))
  }

  private isValuesNotJSON(obj: Record<string, any> | { file_id: string, file_title: string, file_extension: string | null }): boolean {
    return 'file_id' in obj && 'file_title' in obj && 'file_extension' in obj;
  }
}

// Any functions that 
contextBridge.exposeInMainWorld('electronAPI', {
  // ----- One-way Communcation
  // Renderer to Main
  getLocalFileDirectory: () => ipcRenderer.send("GET_LOCAL_FILE_DIRECTORY"),
  getCloudConnectionStatuses: () => ipcRenderer.send("GET_CLOUD_CONNECTION_STATUSES"),

  // Main to renderer
  receiveLocalFileDirectory: (callback) => ipcRenderer.on("GET_LOCAL_FILE_DIRECTORY__SEND_DIRECTORY_TO_RENDERER",
  (event, localFileDirectoryJSON) => callback(localFileDirectoryJSON)),

  receiveCloudConnectionStatus: (callback) => ipcRenderer.on("HOMEPAGE_CLOUD_AUTH__SEND_CONNECTION_RESULT_TO_RENDERER",
  (event, cloudService, connectionStatus) => callback(cloudService, connectionStatus)),

  // Any to Main
  consoleLog: (logStatement) => ipcRenderer.send("CONSOLE_LOG", { message: logStatement }),


  // ----- Two-way Communication
  // Module installs
  requestImportPythonShell: () => ipcRenderer.invoke("REQUEST_IMPORT_PYTHON_SHELL"),
  requestImportPath: () => ipcRenderer.invoke("IMPORT_PATH"),
})

contextBridge.exposeInMainWorld('fileClasses', {
  createFileNode: (vals: Record<string, any> | { file_id: string, file_title: string, file_extension: string | null }) => new FileNode({ ...vals, show: false }),
})