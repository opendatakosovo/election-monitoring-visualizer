from flask import render_template, request, redirect, url_for
from flask.views import MethodView
from urllib2 import Request, urlopen, URLError
import json
import requests
from emv import utils

class Search(MethodView):	

	methods=['GET']

	def dispatch_request(self, observer, year, election_type, election_round):
		''' Search for observations.
		:param observer: The election monitoring organization
		:param year: The election year.
		:param election_type: The election type.
		:param election_round: The election round.
		'''
		api_url = utils.get_api_url(observer)
		
		# Get polling stations dictionary for the search select boxes.
		polling_stations_url = '%s/polling-stations/%d/%s/%s' % (api_url, year, election_type, election_round)

		# Fetch response
		polling_station_grouped_by_commune_response = urlopen(polling_stations_url).read()

		# Convert response into a Dictionary
		polling_station_grouped_by_commune_dict = json.loads(polling_station_grouped_by_commune_response)

		# Search criterias
		cmn = request.args.get('commune_select')
		ps = request.args.get('polling_station_select')
		uvc = request.args.get('ultra_violet_control_select')
		fs = request.args.get('finger_sprayed_select')
		mvc = request.args.get('missing_voting_cabin')
		mbb = request.args.get('missing_ballot_box')
		mb = request.args.get('missing_ballots')
		mvb = request.args.get('missing_voters_book')
		mul = request.args.get('missing_uv_lamp')

		url_params = (api_url, year, election_type, election_round, cmn, ps, uvc, fs, mvc, mbb, mb, mvb, mul)
	
		search_url = '%s/search/%d/%s/%s/?commune_select=%s&polling_station_select=%s&ultra_violet_control_select=%s&finger_sprayed_select=%s&missing_voting_cabin=%s&missing_ballot_box=%s&missing_ballots=%s&missing_voters_book=%s&missing_uv_lamp=%s' % url_params

		# Request the JSON Document from the URL Results
		search_result = requests.get(search_url).json()

		directory_path = '%s/%d/%s/%s' % (observer, year, election_type, election_round)

		return render_template('search.html', directory_path=directory_path, polling_station_grouped_by_commune_dict=polling_station_grouped_by_commune_dict, search_result=search_result)



