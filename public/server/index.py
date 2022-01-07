import flask, flask_cors, requests, urllib.request, json, os, shutil

app = flask.Flask(__name__)
cors = flask_cors.CORS(app)
app.config["DEBUG"] = True
app.config["CORS_HEADERS"] = 'Content-Type'

@app.route('/steam/file/libraryfolders.vdf', methods=['GET'])
@flask_cors.cross_origin()
def steam_file_libraryfolders():
	return requests.get("https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=A9BE8D7D551A2570041944C401C22FBC&steamid=76561198446051555&include_appinfo=true&format=json", {
		"content-type": "application/json",
		"Access-Control-Allow-Origin": "*"
	}).text

@app.route('/steam/games', methods=['GET'])
@flask_cors.cross_origin()
def steam_games():
	return requests.get("http://api.steampowered.com/ISteamApps/GetAppList/v0002/", {
		"content-type": "application/json",
		"Access-Control-Allow-Origin": "*"
	}).json()

@app.route('/cache/reload', methods=['POST'])
@flask_cors.cross_origin()
def cache_reload():
	request = flask.request.get_json()
	for i in request['steamgames']:
		try:
			urllib.request.urlretrieve(f"https://steamcdn-a.akamaihd.net/steam/apps/{i['appid']}/library_600x900_2x.jpg", os.path.join(os.path.dirname(os.path.abspath(__file__)), f"../src/Assets/Banners/Banner_{i['appid']}_600x900.jpg"))
		except:
			shutil.copy2(os.path.join(os.path.dirname(os.path.abspath(__file__)), f"../src/Assets/Banner_Default_600x900.jpg"), os.path.join(os.path.dirname(os.path.abspath(__file__)), f"../src/Assets/Banners/Banner_{i['appid']}_600x900.jpg"))
	return json.dumps({'success':True}), 200, {'ContentType':'application/json'} 

app.run(host='0.0.0.0', port=666)