const path = require('path');
const { app, BrowserWindow, shell } = require('electron');
const cheerio = require('cheerio');
const fetch = require('node-fetch');
const open = require('open');
const fs = require('fs');
const https = require('https');
const download = require('image-downloader');
const appDir = path.dirname(require.main.filename);
const unzipper = require('unzipper');
var exec = require('child_process').execFile;
var GithubDownloader = require('download-github-release');
var bodyParser = require('body-parser');
var express = require('express');
var cors = require('cors');
var api = express();
var jsonParser = bodyParser.json();
var Config;
if (app.isPackaged) {
	Config = require('../../../Config/Config.json');
} else {
	Config = require('../src/Config/Config.json');
}

function createWindow() {
	if (app.isPackaged) {
		if (!fs.existsSync(path.join(__dirname, '../../../Assets/Banners'))) {
			fs.mkdirSync(path.join(__dirname, '../../../Assets/Banners'));
		}
		if (!fs.existsSync(path.join(__dirname, '../../../Assets/Headers'))) {
			fs.mkdirSync(path.join(__dirname, '../../../Assets/Headers'));
		}
		if (!fs.existsSync(path.join(__dirname, '../../../Assets/Icons'))) {
			fs.mkdirSync(path.join(__dirname, '../../../Assets/Icons'));
		}
		if (!fs.existsSync(path.join(__dirname, '../../../Mods'))) {
			fs.mkdirSync(path.join(__dirname, '../../../Mods'));
		}
	} else {
		if (!fs.existsSync(path.join(__dirname, '../src/Assets/Banners'))) {
			fs.mkdirSync(path.join(__dirname, '../src/Assets/Banners'));
		}
		if (!fs.existsSync(path.join(__dirname, '../src/Assets/Headers'))) {
			fs.mkdirSync(path.join(__dirname, '../src/Assets/Headers'));
		}
		if (!fs.existsSync(path.join(__dirname, '../src/Assets/Icons'))) {
			fs.mkdirSync(path.join(__dirname, '../src/Assets/Icons'));
		}
		if (!fs.existsSync(path.join(__dirname, '../src/Mods'))) {
			fs.mkdirSync(path.join(__dirname, '../src/Mods'));
		}
	}
	fetch(`http://localhost:666/cache/load`, {
		'content-type': 'application/json',
		'Access-Control-Allow-Origin': '*',
	});
	const newConfig = Config;
	const mainWindow = new BrowserWindow({
		title: Config.General.Title,
		icon: './favicon.ico',
		width: Config.General.Width,
		height: Config.General.Height,
		webPreferences: {
			nodeIntegration: true,
		},
		autoHideMenuBar: Config.General.AutoHideMenuBar,
	});
	if (app.isPackaged) {
		newConfig.General.IsPackaged = true;
		newConfig.General.Root = path.join(appDir.replace(/\\/g, '/'), '../');
		fs.writeFileSync(
			path.join(__dirname, '../../../Config/Config.json'),
			`${JSON.stringify(newConfig)}`
		);
		mainWindow.loadFile(path.join(__dirname, '../build/index.html'));
	} else {
		newConfig.General.IsPackaged = false;
		newConfig.General.Root = path.join(appDir.replace(/\\/g, '/'), '../src/');
		fs.writeFileSync(
			path.join(__dirname, '../src/Config/Config.json'),
			`${JSON.stringify(newConfig)}`
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

function filterRelease(release) {
	return release.prerelease === false;
}

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
		`https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${Config.Steam.SteamKey}&steamid=${Config.Steam.SteamID}&include_appinfo=true&format=json`,
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
		`https://api.steampowered.com/ISteamUserStats/GetPlayerAchievements/v1/?key=${Config.Steam.SteamKey}&steamid=${Config.Steam.SteamID}&appid=${req.params.id}&l=english&include_appinfo=true&format=json`,
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
	res.send(Config);
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

api.get('/steam/verify/:id', (req, res) => {
	shell.openExternal(`steam://validate/${req.params.id}`);
	res.sendStatus(200);
});

api.get('/steam/uninstall/:id', (req, res) => {
	shell.openExternal(`steam://uninstall/${req.params.id}`);
	res.sendStatus(200);
});

api.get('/mods/exists/:id', (req, res) => {
	if (Config.Mods.Supported[req.params.id]) {
		if (app.isPackaged) {
			if (
				fs.existsSync(
					path.join(
						__dirname,
						`../../../Mods/${Config.Mods.Supported[req.params.id].FileName}`
					)
				)
			) {
				res.sendStatus(200);
			} else {
				res.sendStatus(406);
			}
		} else {
			if (
				fs.existsSync(
					path.join(
						__dirname,
						`../src/Mods/${Config.Mods.Supported[req.params.id].FileName}`
					)
				)
			) {
				res.sendStatus(200);
			} else {
				res.sendStatus(406);
			}
		}
	} else {
		res.sendStatus(406);
	}
});

api.get('/mods/launch/:id', (req, res) => {
	if (app.isPackaged) {
		exec(
			path.join(
				__dirname,
				'../../../Mods/',
				Config.Mods.Supported[req.params.id].FilePath,
				Config.Mods.Supported[req.params.id].FileName
			)
		);
		res.sendStatus(200);
	} else {
		exec(
			path.join(
				__dirname,
				'../src/Mods/',
				Config.Mods.Supported[req.params.id].FilePath,
				Config.Mods.Supported[req.params.id].FileName
			)
		);
		res.sendStatus(200);
	}
});

api.get('/mods/download/:id', (req, res) => {
	let downloaded = false;
	if (app.isPackaged) {
		if (
			fs.existsSync(
				path.join(
					__dirname,
					'../../../Mods/',
					Config.Mods.Supported[req.params.id].FilePath,
					Config.Mods.Supported[req.params.id].FileName
				)
			)
		) {
			downloaded = true;
		}
	} else {
		if (
			fs.existsSync(
				path.join(
					__dirname,
					'../src/Mods/',
					Config.Mods.Supported[req.params.id].FilePath,
					Config.Mods.Supported[req.params.id].FileName
				)
			)
		) {
			downloaded = true;
		}
	}
	if (!downloaded) {
		if (Config.Mods.Supported[req.params.id]) {
			if (Config.Mods.Supported[req.params.id].Type === 'Github') {
				if (app.isPackaged) {
					GithubDownloader(
						Config.Mods.Supported[req.params.id].User,
						Config.Mods.Supported[req.params.id].Repo,
						path.join(__dirname, `../../../Mods`),
						filterRelease,
						() => {
							return true;
						},
						true
					)
						.then(() => {
							res.sendStatus(200);
						})
						.catch((err) => {
							console.error(err.message);
							res.sendStatus(500);
						});
				} else {
					GithubDownloader(
						Config.Mods.Supported[req.params.id].User,
						Config.Mods.Supported[req.params.id].Repo,
						path.join(__dirname, `../src/Mods`),
						filterRelease,
						() => {
							return true;
						},
						true
					)
						.then(() => {
							res.sendStatus(200);
						})
						.catch((err) => {
							console.error(err.message);
							res.sendStatus(500);
						});
				}
			} else {
				https.get(Config.Mods.Supported[req.params.id].Download, (response) => {
					if (app.isPackaged) {
						const file = fs.createWriteStream(
							path.join(
								__dirname,
								`../../../Mods/${Config.Mods.Supported[req.params.id].FileName}`
							)
						);
						response.pipe(file);
						file.on('finish', () => {
							file.close();
							if (Config.Mods.Supported[req.params.id].FileType === 'zip') {
								fs.createReadStream(
									path.join(
										__dirname,
										`../../../Mods/${
											Config.Mods.Supported[req.params.id].FileName
										}`
									)
								).pipe(
									unzipper.Extract({
										path: path.join(
											__dirname,
											`../../../Mods/${
												Config.Mods.Supported[req.params.id].ExtractPath
											}`
										),
									})
								);
							}
						});
						res.sendStatus(200);
					} else {
						const file = fs.createWriteStream(
							path.join(
								__dirname,
								`../src/Mods/${Config.Mods.Supported[req.params.id].FileName}`
							)
						);
						response.pipe(file);
						file.on('finish', () => {
							file.close();
							if (Config.Mods.Supported[req.params.id].FileType === 'zip') {
								fs.createReadStream(
									path.join(
										__dirname,
										`../src/Mods/${
											Config.Mods.Supported[req.params.id].FileName
										}`
									)
								).pipe(
									unzipper.Extract({
										path: path.join(
											__dirname,
											`../src/Mods/${
												Config.Mods.Supported[req.params.id].ExtractPath
											}`
										),
									})
								);
							}
						});
						res.sendStatus(200);
					}
				});
			}
		} else {
			res.sendStatus(406);
		}
	}
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

api.post('/app/openexternal', jsonParser, (req, res) => {
	open(req.body.url);
	res.sendStatus(200);
});

api.post('/app/config/post', jsonParser, (req, res) => {
	const newConfig = Config;
	req.body.Config.forEach((data) => {
		newConfig[data.key] = data.value + '\n';
	});
	if (app.isPackaged) {
		fs.writeFileSync('../../../Config/Config.json', `${JSON.stringify(newConfig)}`);
	} else {
		fs.writeFileSync('./Config/Config.json', `${JSON.stringify(newConfig)}`);
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

api.listen(Config.General.APIPort, () =>
	console.log(`API launched sucessfully on: http://localhost:${Config.General.APIPort}`)
);
