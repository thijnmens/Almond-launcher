const path = require('path');
const { app, BrowserWindow, shell } = require('electron');
const cheerio = require('cheerio');
const fetch = require('node-fetch');
const fs = require('fs');
const download = require('image-downloader');
const appDir = path.dirname(require.main.filename);
var bodyParser = require('body-parser');
var express = require('express');
var cors = require('cors');
var api = express();
var jsonParser = bodyParser.json();
var config;
if (app.isPackaged) {
	config = require('../../../Assets/Almond.config.js');
} else {
	config = require('../src/Assets/Almond.config');
}

function createWindow() {
	fetch(`http://localhost:666/cache/load`, {
		'content-type': 'application/json',
		'Access-Control-Allow-Origin': '*',
	});
	const newConfig = config;
	const mainWindow = new BrowserWindow({
		title: config.title,
		icon: './favicon.ico',
		width: config.width,
		height: config.height,
		webPreferences: {
			nodeIntegration: true,
		},
		autoHideMenuBar: config.autoHideMenuBar,
	});
	if (app.isPackaged) {
		newConfig['isPackaged'] = true;
		newConfig['root'] = path.join(appDir.replace(/\\/g, '/'), '../');
		fs.writeFileSync(
			path.join(__dirname, '../../../Assets/Almond.config.js'),
			`module.exports = ${JSON.stringify(newConfig)}`
		);
		mainWindow.loadFile(path.join(__dirname, '../build/index.html'));
	} else {
		newConfig['isPackaged'] = false;
		newConfig['root'] = path.join(appDir.replace(/\\/g, '/'), '../src/');
		fs.writeFileSync(
			path.join(__dirname, '../src/Assets/Almond.config.js'),
			`module.exports = ${JSON.stringify(newConfig)}`
		);
		mainWindow.loadURL('http://localhost:3000');
	}
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit();
	}
});

app.on('activate', () => {
	if (BrowserWindow.getAllWindows().length === 0) {
		createWindow();
	}
});

/////////////
//   API   //
/////////////

async function downloadImage(url, filepath, type) {
	return download
		.image({
			url,
			dest: filepath,
		})
		.catch(() => {
			if (app.isPackaged) {
				fs.copyFile(`./Assets/${type.type}_Default_${type.res}.jpg`, filepath, (err) => {
					if (err) throw err;
				});
			} else {
				fs.copyFile(
					`./src/Assets/${type.type}_Default_${type.res}.jpg`,
					filepath,
					(err) => {
						if (err) throw err;
					}
				);
			}
		});
}

api.use(cors());

api.get('/', (req, res) => {
	res.redirect('https://www.youtube.com/watch?v=dQw4w9WgXcQ?t=0');
});

api.get('/steam/games', async (req, res) => {
	const games = {
		response: {
			game_count: 0,
			games: [],
		},
	};
	const responseGame = await fetch(
		`https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${config.Steam_Key}&steamid=${config.Steam_ID}&include_appinfo=true&format=json`,
		{ 'content-type': 'application/json', 'Access-Control-Allow-Origin': '*' }
	);
	if (responseGame.status !== 200) {
		res.send(games);
	}
	const file = await responseGame.json();
	games.response.game_count = file.response.game_count;
	for (const data of file.response.games) {
		const parsedFile = {
			launcher: 'steam',
			appid: data.appid,
			name: data.name,
			playtime_forever: data.playtime_forever,
			img_icon_url: data.img_icon_url,
			img_logo_url: data.img_logo_url,
			playtime_windows_forever: data.playtime_windows_forever,
			playtime_mac_forever: data.playtime_mac_forever,
			playtime_linux_forever: data.playtime_linux_forever,
		};
		games.response.games.push(parsedFile);
	}

	res.send(games);
});

api.get('/steam/achievements/:id', async (req, res) => {
	const response = await fetch(
		`https://api.steampowered.com/ISteamUserStats/GetPlayerAchievements/v1/?key=${config.Steam_Key}&steamid=${config.Steam_ID}&appid=${req.params.id}&l=english&include_appinfo=true&format=json`,
		{ 'content-type': 'application/json', 'Access-Control-Allow-Origin': '*' }
	);
	if (response.status !== 200) {
		res.send([]);
	} else {
		const achievements = await response.json();
		res.send(achievements);
	}
});

api.get('/epic/games', (req, res) => {
	const dirname = 'C:/ProgramData/Epic/EpicGamesLauncher/Data/Manifests/';

	const getRawData = async (URL) => {
		const response = await fetch(URL);
		const data = response.text();
		return data;
	};

	try {
		var data = [];
		const dirs = fs.readdirSync(dirname, { withFileTypes: true });
		data.push(
			dirs
				.filter((i) => i.isFile())
				.map((filename) => {
					const file = JSON.parse(fs.readFileSync(dirname + filename.name, 'ascii'));
					const URL = `https://www.epicgames.com/store/en-US/browse?q=${file.CatalogItemId}&sortBy=releaseDate&sortDir=ASC&count=1`;
					const getGameImage = async () => {
						const page = await getRawData(URL);
						const $ = cheerio.load(page);
						const a = $(this);
						const gameImage = a.find('.css-1lozana').children('img').eq(0).attr('src');
					};
					getGameImage();
					const parsedfile = {
						launcher: 'epic',
						appid: file.CatalogItemId,
						name: file.DisplayName,
						playtime_forever: 0,
						img_icon_url: '',
						img_logo_url: '',
						playtime_windows_forever: 0,
						playtime_mac_forever: 0,
						playtime_linux_forever: 0,
					};
					return parsedfile;
				})
		);
	} catch {
		data = [];
	}

	res.send(data);
});

api.get('/app/config/get', (req, res) => {
	res.send(config);
});

api.get('/app/files', (req, res) => {
	var srcpath = '';
	const tree = {
		Banners: [],
		Headers: [],
		Icons: [],
	};

	if (app.isPackaged) {
		srcpath = '../../..';
	} else {
		srcpath = '../src';
	}

	const Banners = fs.readdirSync(path.join(appDir, `${srcpath}/Assets/Banners`), (err) => {
		if (err) {
			res.sendStatus(500);
		}
	});

	const Headers = fs.readdirSync(path.join(appDir, `${srcpath}/Assets/Headers`), (err) => {
		if (err) {
			res.sendStatus(500);
		}
	});

	const Icons = fs.readdirSync(path.join(appDir, `${srcpath}/Assets/Icons`), (err) => {
		if (err) {
			res.sendStatus(500);
		}
	});

	tree.Banners = Banners;
	tree.Headers = Headers;
	tree.Icons = Icons;

	res.send(tree);
});

api.get('/steam/launch/:id', (req, res) => {
	shell.openExternal(`steam://rungameid/${req.params.id}`);
	res.sendStatus(200);
});

api.get('/cache/banner/:id', (req, res) => {
	if (app.isPackaged) {
		res.sendFile(
			path.join(__dirname, `../../../Assets/Banners/Banner_${req.params.id}_600x900.jpg`)
		);
	} else {
		res.sendFile(
			path.join(__dirname, `../src/Assets/Banners/Banner_${req.params.id}_600x900.jpg`)
		);
	}
});

api.get('/cache/header/:id', (req, res) => {
	if (app.isPackaged) {
		res.sendFile(
			path.join(__dirname, `../../../Assets/Headers/Header_${req.params.id}_1920x620.jpg`)
		);
	} else {
		res.sendFile(
			path.join(__dirname, `../src/Assets/Headers/Header_${req.params.id}_1920x620.jpg`)
		);
	}
});

api.post('/app/config/post', jsonParser, (req, res) => {
	const newConfig = config;
	req.body.config.forEach((data) => {
		newConfig[data.key] = data.value + '\n';
	});
	if (app.isPackaged) {
		fs.writeFileSync(
			'../../../Assets/Almond.config.js',
			`module.exports = ${JSON.stringify(newConfig)}`
		);
	} else {
		fs.writeFileSync(
			'./Assets/Almond.config.js',
			`module.exports = ${JSON.stringify(newConfig)}`
		);
	}
	res.sendStatus(200);
});

api.post('/cache/load', jsonParser, async (req, res) => {
	if (app.isPackaged) {
		req.body.steamgames.map((data) => {
			if (!fs.existsSync(`./Assets/Banners/Banner_${data.appid}_600x900.jpg`)) {
				downloadImage(
					`https://steamcdn-a.akamaihd.net/steam/apps/${data.appid}/library_600x900_2x.jpg`,
					`./Assets/Banners/Banner_${data.appid}_600x900.jpg`,
					{ type: 'Banner', res: '600x900' }
				).catch();
			}
			if (!fs.existsSync(`./src/Assets/Headers/Header_${data.appid}_1920x620.jpg`)) {
				downloadImage(
					`https://cdn.cloudflare.steamstatic.com/steam/apps/${data.appid}/library_hero.jpg`,
					`./Assets/Headers/Header_${data.appid}_1920x620.jpg`,
					{ type: 'Header', res: '1920x620' }
				).catch();
			}
		});
	} else {
		req.body.steamgames.map((data) => {
			if (!fs.existsSync(`./src/Assets/Banners/Banner_${data.appid}_600x900.jpg`)) {
				downloadImage(
					`https://steamcdn-a.akamaihd.net/steam/apps/${data.appid}/library_600x900_2x.jpg`,
					`./src/Assets/Banners/Banner_${data.appid}_600x900.jpg`,
					{ type: 'Banner', res: '600x900' }
				).catch();
			}
			if (!fs.existsSync(`./src/Assets/Headers/Header_${data.appid}_1920x620.jpg`)) {
				downloadImage(
					`https://cdn.cloudflare.steamstatic.com/steam/apps/${data.appid}/library_hero.jpg`,
					`./src/Assets/Headers/Header_${data.appid}_1920x620.jpg`,
					{ type: 'Header', res: '1920x620' }
				).catch();
			}
		});
	}
	res.sendStatus(200);
});

api.post('/cache/reload', jsonParser, async (req, res) => {
	if (app.isPackaged) {
		req.body.steamgames.map((data) => {
			downloadImage(
				`https://steamcdn-a.akamaihd.net/steam/apps/${data.appid}/library_600x900_2x.jpg`,
				`./Assets/Banners/Banner_${data.appid}_600x900.jpg`,
				{ type: 'Banner', res: '600x900' }
			).catch();
		});
		if (!fs.existsSync(`./src/Assets/Headers/Header_${data.appid}_1920x620.jpg`)) {
			downloadImage(
				`https://cdn.cloudflare.steamstatic.com/steam/apps/${data.appid}/library_hero.jpg`,
				`./Assets/Headers/Header_${data.appid}_1920x620.jpg`,
				{ type: 'Header', res: '1920x620' }
			).catch();
		}
	} else {
		req.body.steamgames.map((data) => {
			downloadImage(
				`https://steamcdn-a.akamaihd.net/steam/apps/${data.appid}/library_600x900_2x.jpg`,
				`./src/Assets/Banners/Banner_${data.appid}_600x900.jpg`,
				{ type: 'Banner', res: '600x900' }
			).catch();
		});
		if (!fs.existsSync(`./src/Assets/Headers/Header_${data.appid}_1920x620.jpg`)) {
			downloadImage(
				`https://cdn.cloudflare.steamstatic.com/steam/apps/${data.appid}/library_hero.jpg`,
				`./src/Assets/Headers/Header_${data.appid}_1920x620.jpg`,
				{ type: 'Header', res: '1920x620' }
			).catch();
		}
	}
	res.sendStatus(200);
});

api.listen(config.API_port, () =>
	console.log(`API launched sucessfully on: http://localhost:${config.API_port}`)
);
