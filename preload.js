const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    selectJarFile: () => ipcRenderer.invoke('dialog:selectJarFile'),
    selectCrxFolder: () => ipcRenderer.invoke('dialog:selectCrxFolder'),
    startAEM: (jarFilePath, crxFolderPath) => ipcRenderer.invoke('startAEM', jarFilePath, crxFolderPath),
    onLogMessage: (callback) => ipcRenderer.on('log-message', callback)
});

