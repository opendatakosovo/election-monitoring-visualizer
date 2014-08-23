from flask import request, Response
from flask.views import View
from urllib2 import urlopen
from emv import utils

class Observation(View):

	methods=['GET']

	def dispatch_request(self, observer, year, election_type, election_round, commune_name, polling_station_name):
		
		# Get KDI API URL.
		kdi_api_url = utils.get_api_url(observer)

		# Build GET Request URL.
		url ='%s/%d/%s/%s/%s/%s' % (kdi_api_url, year, election_type, election_round, commune_name, polling_station_name)

		# Get and return JSON response.
		observations = urlopen(url).read()

		resp = Response(response=observations, mimetype='application/json')

		return resp
