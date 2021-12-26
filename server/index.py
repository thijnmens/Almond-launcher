import flask, flask_cors

app = flask.Flask(__name__)
cors = flask_cors.CORS(app)
app.config["DEBUG"] = True
app.config["CORS_HEADERS"] = 'Content-Type'

@app.route('/', methods=['GET'])
@flask_cors.cross_origin()
def home():
	return {"i am": 'thijn'}

app.run(host='0.0.0.0', port=666)