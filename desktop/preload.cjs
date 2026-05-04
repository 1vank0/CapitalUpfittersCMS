const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('botApi', {
  run: (args) => ipcRenderer.invoke('bot:run', args),
})
