from flask import render_template, request, redirect, url_for
from flask.views import View
from urllib2 import Request, urlopen, URLError
import json
from emv import utils

class Commune(View):	
	methods = ['GET']

	def dispatch_request(self, observer, year, election_type, election_round, commune_slug):

		# Get KDI api url
		kdi_api_url = utils.get_api_url(observer)

		# We need the commune name (we only have the slug).
		# A bit hardore but plet's get it by making a GET request to polling stations JSON data.
		commune_polling_stations_request_url = '%s/polling-stations/%d/%s/%s/%s' % (kdi_api_url, year, election_type, election_round, commune_slug)

		# Open the JSON Document.
		polling_stations_response = urlopen(commune_polling_stations_request_url).read()

		# Get the commune name.
		polling_stations_dict = json.loads(polling_stations_response)
		commune_name = polling_stations_dict[commune_slug]['name']

		# Request the KVV members gender distribution.
		kvv_request_url = '%s/kvv-members-gender-distribution/%d/%s/%s/%s' % (kdi_api_url, year, election_type, election_round, commune_slug)
		
		# Open the JSON Document.
		kvvMGD_response = urlopen(kvv_request_url).read()

		# Convert JSON into a Dictionary
		kvv_members_gender_distribution_dict = json.loads(kvvMGD_response)

		# Request hour vote count.
		votes_by_hours_request_url ='%s/votes-count/%d/%s/%s/%s' % (kdi_api_url, year, election_type, election_round, commune_slug)

		# Open the JSON Document.
		votes_by_hour_response = urlopen(votes_by_hours_request_url).read()

		# Convert JSON into a Dictionary.
		votes_by_hour_dict = json.loads(votes_by_hour_response)

		return render_template('observation.html', kvv=kvv_members_gender_distribution_dict, votes_by_hour=votes_by_hour_dict, commune_name=commune_name, polling_station_name=None, room_number=None)



