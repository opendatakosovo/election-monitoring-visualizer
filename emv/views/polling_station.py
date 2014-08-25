from flask import render_template, request, redirect, url_for
from flask.views import MethodView
from urllib2 import Request, urlopen, URLError
import json
from emv import utils

class PollingStation(MethodView):
	methods = ['GET']

	def dispatch_request(self, observer, year, election_type, election_round, commune, polling_station_name):

		# get KDI api url
		kdi_api_url = utils.get_api_url(observer)
		
		#URL to request from KDI API for KVV MEMBERS GENDER DISTRIBUTION
		kvv_genders_request_url = '%s/kvv-members-gender-distribution/%d/%s/%s/%s/%s' % (kdi_api_url, year, election_type, election_round, commune, polling_station_name)

		# Open the JSON Document requested from the EMA
		kvv_response = urlopen(kvv_genders_request_url).read()

		# Convert JSON into a Dictionary
		kvv_json = json.loads(kvv_response)

		# URL to request from KDI API for VOTES COUNT BY HOUR
		votes_by_hour_request_url = '%s/votes-count/%d/%s/%s/%s/%s' % (kdi_api_url, year, election_type, election_round, commune, polling_station_name)

		# Open the JSON Document requested from the EMA
		votes_by_hour_response = urlopen(votes_by_hour_request_url).read()
 
		# Convert JSON into a Dictionary
		votes_by_hour_json=json.loads(votes_by_hour_response)

		return render_template('observation.html', kvvMGD = kvv_json,votesByHour = votes_by_hour_json)
