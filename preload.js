const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  listPorts: () => ipcRenderer.invoke('list-ports'),
  killPid: (pid) => ipcRenderer.invoke('kill-pid', pid),
});
