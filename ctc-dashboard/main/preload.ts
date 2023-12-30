const { contextBridge, ipcRenderer } = require('electron')

// Any functions that 
contextBridge.exposeInMainWorld('electronAPI', {
  // ----- One-way Communcation
  // Renderer to Main
  getLocalFileDirectory: () => ipcRenderer.send("GET_LOCAL_FILE_DIRECTORY"),

  // Main to renderer
  receiveLocalFileDirectory: (callback) => ipcRenderer.on("GET_LOCAL_FILE_DIRECTORY__SEND_DIRECTORY_TO_RENDERER", (_event, localFileDirectoryJSON) => callback(localFileDirectoryJSON)),

  // Any to Main
  consoleLog: (logStatement) => ipcRenderer.send("CONSOLE_LOG", { message: logStatement }),

  // Module installs


  // ----- Two-way Communication
  // Module installs
  requestImportPythonShell: () => ipcRenderer.invoke("REQUEST_IMPORT_PYTHON_SHELL"),
  requestImportPath: () => ipcRenderer.invoke("IMPORT_PATH"),
})

// Define tree classes
class FileNode {
  file_id: string;
  file_title: string;
  file_extension: string | null;
  children: FileNode[];

  constructor(constructor_values: Record<string, any> | {file_id: string, file_title: string, file_extension: string | null}) {  
    this.file_id = constructor_values.file_id;
    this.file_title = constructor_values.file_title;
    this.file_extension = constructor_values.file_extension;

    if (this.isValuesNotJSON(constructor_values)) { 
      this.children = []
    } else {
      // @ts-ignore
      this.children = constructor_values.children.map((child_json) => new FileNode(child_json))
    }
  }

  add_child(child: FileNode) {
      this.children.push(child);
  }

  create_child( file_id: string, file_title: string, file_extension: string | null) {
      this.children.push(new FileNode( {file_id, file_title, file_extension} ))
  }

  private isValuesNotJSON(obj: Record<string, any> | { file_id: string, file_title: string, file_extension: string | null }): boolean {
    return 'file_id' in obj && 'file_title' in obj && 'file_extension' in obj;
  }
}