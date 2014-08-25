from flask import render_template, request, redirect, url_for
from flask.views import View
from urllib2 import Request, urlopen, URLError
import json
from emv import utils

class RoomNumber(View):
	methods=['GET']

	def dispatch_request(self, observer, year, election_type, election_round, commune_slug, polling_station_slug, room_number):
		
		# Get KDI api url.
		kdi_api_url = utils.get_api_url(observer)

		# We need the commune name (we only have the slug).
		# A bit hardore but plet's get it by making a GET request to polling stations JSON data.
		commune_polling_stations_request_url = '%s/polling-stations/%d/%s/%s/%s' % (kdi_api_url, year, election_type, election_round, commune_slug)

		# Open the JSON Document.
		polling_stations_response = urlopen(commune_polling_stations_request_url).read()

		# Get the commune and polling station name.
		polling_stations_dict = json.loads(polling_stations_response)
		commune_name = polling_stations_dict[commune_slug]['name']
		polling_station_name = polling_stations_dict[commune_slug]['pollingStations'][0]['name']
	
		# URL to request from KDI API for KVV members gender distribution.
		url = '%s/kvv-members-gender-distribution/%d/%s/%s/%s/%s/%s' % (kdi_api_url, year, election_type, election_round, commune_slug, polling_station_slug, room_number)

		# Fetch data.
		kvv_response = urlopen(url).read()

		# Convert JSON into a Dictionary
		kvv_dict = json.loads(kvv_response)

		# FIXME: Sometimesthe result is empty. Why? e.g. /kdi/kvv-members-gender-distribution/2013/localelections/first-round/ferizaj/fetah-sylejmani
		if len(kvv_dict['result']) == 0:
			kvv_dict = None

		# URL to request from KDI API for vote counts by hour
		votes_count_url = '%s/votes-count/%d/%s/%s/%s/%s/%s' % (kdi_api_url, year, election_type, election_round, commune_slug, polling_station_slug, room_number)

		# Fetch data.
		votes_by_hour_response = urlopen(votes_count_url).read()

		# Convert JSON into a Dictionary
		votes_by_hour_dict = json.loads(votes_by_hour_response)

		return render_template('observation.html', kvv=kvv_dict, votes_by_hour=votes_by_hour_dict, commune_name=commune_name, polling_station_name=polling_station_name , room_number=room_number)
