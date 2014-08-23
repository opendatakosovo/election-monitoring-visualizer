from flask import render_template, request, redirect, url_for
from flask.views import View
from emv import utils
from urllib2 import Request, urlopen, URLError
import json

class Index(View):
	methods=['GET']

	def dispatch_request(self, observer=None, year=None, election_type=None, election_round=None):
		
		''' Get polling stations grouped by commune.
		:param observer: The election monitoring organization
		:param year: The election year.
		:param election_type: The election type.
		:param election_round: The election round.
		'''
		polling_station_grouped_by_commune_dict = {}

		if observer != None and year != None and election_type != None and election_round != None:
			api_url = utils.get_api_url(observer)
			url = '%s/polling-stations/%d/%s/%s' % (api_url, year, election_type, election_round)

			# Open the JSON Document requested from the EMA
			polling_station_grouped_by_commune_response = urlopen(url).read()
			# Convert JSON into a Dictionary
			polling_station_grouped_by_commune_dict = json.loads(polling_station_grouped_by_commune_response)
		

		return render_template('index.html', polling_station_grouped_by_commune_dict=polling_station_grouped_by_commune_dict)

