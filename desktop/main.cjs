const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const { execFile } = require('child_process')

function createWindow() {
  const win = new BrowserWindow({
    width: 980,
    height: 760,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  win.loadFile(path.join(__dirname, 'index.html'))
}

app.whenReady().then(() => {
  createWindow()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

ipcMain.handle('bot:run', async (_event, args) => {
  return new Promise((resolve) => {
    execFile('node', ['scripts/fb-marketplace-bot.mjs', ...args], { cwd: process.cwd() }, (error, stdout, stderr) => {
      resolve({ ok: !error, stdout, stderr, code: error?.code ?? 0 })
    })
  })
})
