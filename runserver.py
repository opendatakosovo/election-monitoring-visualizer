from flask import Flask, request, render_template, Response
import flask
import requests
from flask.ext.pymongo import PyMongo
from flask import request
import pymongo
from collections import OrderedDict
import bson
import json
from bson import json_util
from bson.son import SON
from urllib2 import Request, urlopen, URLError

app = Flask(__name__)
app.debug = True

# connect to MongoDB database
app.config['MONGO_DBNAME'] = 'kdi'
mongo = PyMongo(app, config_prefix='MONGO')

kdi_api_url = 'http://127.0.0.1:5001/api/kdi/observations'

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

	# FIXME: fix this by creating slug values in database
	commune = commune.replace(' ', '%20')
	polling_station_name = polling_station_name.replace(' ', '%20')
	
	#URL to request from KDI API for KVV MEMBERS GENDER DISTRIBUTION
	url = '%s/kvv-members-gender-distribution/2013/local-elections/first-round/%s/%s' % (kdi_api_url, commune, polling_station_name)
	# Open the JSON Document requested from the EMA
	kvv_response = urlopen(url).read()
	# Convert JSON into a Dictionary
	kvv_json=json.loads(kvv_response)

	#URL to request from KDI API for VOTES COUNT BY HOUR
	url1 = '%s/votes-count/2013/local-elections/first-round/%s/%s' % (kdi_api_url, commune, polling_station_name)
	# Open the JSON Document requested from the EMA
	votes_by_hour_response = urlopen(url1).read()
	# Convert JSON into a Dictionary
	votes_by_hour_json=json.loads(votes_by_hour_response)

	return render_template('observation.html', kvvMGD = kvv_json,votesByHour = votes_by_hour_json)

@app.route('/observation/<string:commune>/<string:polling_station_name>/<string:room_number>', methods=['GET'])
def observation_by_room(commune, polling_station_name,room_number):

	commune = commune.replace(' ', '%20')
	polling_station_name = polling_station_name.replace(' ', '%20')
	
	#URL to request from KDI API for KVV MEMBERS GENDER DISTRIBUTION
	url = '%s/kvv-members-gender-distribution/2013/local-elections/first-round/%s/%s/%s' % (kdi_api_url, commune, polling_station_name,room_number)
	# Open the JSON Document requested from the EMA
	kvv_response = urlopen(url).read()
	# Convert JSON into a Dictionary
	kvv_json=json.loads(kvv_response)

	#URL to request from KDI API for VOTES COUNT BY HOUR
	url1 = '%s/votes-count/2013/local-elections/first-round/%s/%s/%s' % (kdi_api_url, commune, polling_station_name,room_number)
	# Open the JSON Document requested from the EMA
	votes_by_hour_response = urlopen(url1).read()
	# Convert JSON into a Dictionary
	votes_by_hour_json=json.loads(votes_by_hour_response)

	return render_template('observation.html', kvvMGD = kvv_json,votesByHour = votes_by_hour_json)


@app.route('/api/observations/<string:commune>/<string:polling_station_name>', methods=['GET'])
def get_observations(commune, polling_station_name):
	observations = mongo.db.localelectionsfirstround2013.find({'pollingStation.commune': commune, 'pollingStation.name': polling_station_name})
	
	resp = Response(response=json_util.dumps(observations), mimetype='application/json')

	return resp

@app.route('/observation/<string:commune>/', methods=['GET'])
def observations(commune):

	# Request the JSON Document from the Election-Monitoring-API (shortcut EMA) based on commune
	url ='%s/kvv-members-gender-distribution/2013/local-elections/first-round/%s' % (kdi_api_url,commune)
	# Open the JSON Document requested from the EMA
	kvvMGD_response = urlopen(url).read()
	# Convert JSON into a Dictionary
	kvvMGD = json.loads(kvvMGD_response)


	# Request the JSON Document from the Election-Monitoring-API (shortcut EMA) based on commune
	url1 ='%s/votes-count/2013/local-elections/first-round/%s' % (kdi_api_url,commune)
	# Open the JSON Document requested from the EMA
	votes_by_hour_response = urlopen(url1).read()
	# Convert JSON into a Dictionary
	votes_by_hour = json.loads(votes_by_hour_response)

	return render_template('observation.html',kvvMGD = kvvMGD,votesByHour = votes_by_hour)


@app.route('/search/', methods=['GET'])
def search():
		error=None
		commune = request.args.get('commune')
		polling_station = request.args.get('pollingStation')
		ultra_violet_control = request.args.get('ultraVioletControl')
		finger_sprayed = request.args.get('fingerSprayed')
		

		#print commune,polling_station, ultra_violet_control
		url = 'http://127.0.0.1:5001/kdi/observations/search/2013/local-elections/first-round/?commune=%s&pollingStation=%s&ultraVioletControl=%s&fingerSprayed=%s'%(commune,polling_station,ultra_violet_control,finger_sprayed)

		searchi= requests.get(url)
		searchResults=searchi.json()

		return render_template('search.html',error=error,searchResults=searchResults)

if __name__ == '__main__':
	app.run()
