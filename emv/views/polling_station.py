from flask import render_template, request, redirect, url_for
from flask.views import MethodView
from urllib2 import Request, urlopen, URLError
import json
from bson import json_util

class PollingStation(MethodView):
# FIXME: fix this by creating slug values in database	
	methods=['GET']
	def dispatch_request(self, commune, polling_station_name):
		commune = commune.replace(' ', '%20')
		polling_station_name = polling_station_name.replace(' ', '%20')
		kdi_api_url = 'http://127.0.0.1:5001/api/kdi/observations'
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
