const path = require('path');
const {app, BrowserWindow, ipcMain} = require('electron');
const { exec } = require('child_process');
//import raw from 'C:/Program Files (x86)/Steam/steamapps/libraryfolders.vdf'

function createWindow() {
	const mainWindow = new BrowserWindow({
		title: 'Almond Launcher',
		icon: './favicon.ico',
		width: 800,
		height: 600,
		webPreferences: {
			nodeIntegration: true,
		},
	})
	if (app.isPackaged) {
		mainWindow.loadFile(path.join(__dirname, "../build/index.html"));
		exec("sudo Not Yet Implemented")
	} else {
		mainWindow.loadURL("http://localhost:3000");
		exec(`python ${path.join(__dirname, "../server/index.py")}`, (error, stdout, stderr) => {
			if (error) {
				console.error(`exec error: ${error}`);
				return;
			}
				console.log(`stdout: ${stdout}`);
				console.error(`stderr: ${stderr}`);
		});
	}
};

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
	if (process.platform !== 'darwin') {
		app.quit();
	}
});

app.on("activate", () => {
	if (BrowserWindow.getAllWindows().length === 0) {
		createWindow();
	}
});
