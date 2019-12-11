var electron = require("electron");

electron.app.on("window-all-closed", function() {
	electron.app.quit();
});

electron.app.on("ready", function() {
	var mainWindow = new electron.BrowserWindow({
		width: 1280,
		height: 1024,
		resizable: true,
		fullscreen: true,
		webPreferences: {
			nodeIntegration: true
		}
	});
	mainWindow.loadURL("file://" + __dirname + "/index.html");
	mainWindow.on("closed", function() {
		mainWindow = null;
	});
});
