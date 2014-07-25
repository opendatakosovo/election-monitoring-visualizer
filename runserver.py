from flask import Flask, request, render_template, Response
from flask.ext.pymongo import PyMongo
import pymongo
from collections import OrderedDict
from bson import json_util

app = Flask(__name__)
app.debug = True

# connect to MongoDB database
app.config['MONGO_DBNAME'] = 'kdi'
mongo = PyMongo(app, config_prefix='MONGO')

@app.route('/')
def index():

	polling_stations = mongo.db.localelectionsfirstround2013.find().sort([("pollingStation.commune", pymongo.ASCENDING), ("pollingStation.name", pymongo.ASCENDING), ("pollingStation.roomNumber", pymongo.ASCENDING)])

	polling_station_grouped_by_commune_dict = OrderedDict()

	for idx, polling_station in enumerate(polling_stations):

		# If first time we stumble on commune, create a dictionary entry for it.
		# The value for each dictionary entry is a set of election observations docs for this commune.
		if polling_station['pollingStation']['commune'] not in polling_station_grouped_by_commune_dict:
			polling_station_grouped_by_commune_dict[polling_station['pollingStation']['commune']] = [polling_station['pollingStation']['name']]

		else:
			# If not first time we stumble on commune, just add to the list of election observation document for that commune.
			# Don't add if we've already covered that polling station (based on the name of the polling station)
			if polling_station['pollingStation']['name'] not in polling_station_grouped_by_commune_dict[polling_station['pollingStation']['commune']]:

				if polling_station['pollingStation']['name'] != 'N/A': #FIXME: clean database for this case
					polling_station_grouped_by_commune_dict[polling_station['pollingStation']['commune']].append(polling_station['pollingStation']['name']) 

	return render_template('index.html', polling_station_grouped_by_commune_dict=polling_station_grouped_by_commune_dict)

@app.route('/observation/<string:commune>/<string:polling_station_name>', methods=['GET'])
def observation(commune, polling_station_name):
	observations = mongo.db.localelectionsfirstround2013.find({'pollingStation.commune': commune, 'pollingStation.name': polling_station_name})
	return render_template('observation.html', observations=observations)

@app.route('/api/observations/<string:commune>/<string:polling_station_name>', methods=['GET'])
def get_observations(commune, polling_station_name):
	observations = mongo.db.localelectionsfirstround2013.find({'pollingStation.commune': commune, 'pollingStation.name': polling_station_name})

	resp = Response(response=json_util.dumps(observations), mimetype='application/json')

	return resp

@app.route('/observation/<string:commune>/', methods=['GET'])
def observations(commune):
	observations = mongo.db.localelectionsfirstround2013.find({'pollingStation.commune':commune})
	return render_template('observation.html', observations=observations)


if __name__ == '__main__':
	app.run()
