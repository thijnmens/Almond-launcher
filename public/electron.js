const path = require('path');
const {app, BrowserWindow, ipcMain} = require('electron');
const { PythonShell } = require('python-shell');

var backend;

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
	} else {
		mainWindow.loadURL("http://localhost:3000");
	}
	backend = PythonShell.run(`${path.join(__dirname, "./server/index.py")}`, {
		mode: 'text',
		pythonPath: 'python',
		pythonOptions: ['-u'],
		args: ['arg1', 'arg2']
	}, function(err, results) {
		if (err) console.error(err);
		console.log('results: %j', results);
	});
};

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
	// Some shit that kills the backend
	if (process.platform !== 'darwin') {
		app.quit();
	}
});

app.on("activate", () => {
	if (BrowserWindow.getAllWindows().length === 0) {
		createWindow();
	}
});
