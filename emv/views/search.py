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
		directory_path = '%s/%d/%s/%s' % (observer, year, election_type, election_round)
		
		# Get polling stations dictionary for the search select boxes.
		polling_stations_url = '%s/polling-stations/%d/%s/%s' % (api_url, year, election_type, election_round)

		# Fetch response
		polling_station_grouped_by_commune_response = urlopen(polling_stations_url).read()

		# Convert response into a Dictionary
		polling_station_grouped_by_commune_dict = json.loads(polling_station_grouped_by_commune_response)

		# Search criterias
		cmn = request.args.get('commune')
		ps = request.args.get('polling-station')
		uvc = request.args.get('ultra-violet-control')
		fs = request.args.get('finger-sprayed')
		mvc = request.args.get('missing-voting-booth')
		mbb = request.args.get('missing-ballot-box')
		mb = request.args.get('missing-ballots')
		mvb = request.args.get('missing-poll-book')
		mul = request.args.get('missing-uv-lamp')

		search_result = []

		# We don't want to execute the search when we load the page for the first time.
		# Only do the search when we send search criterias in the GET request.
		if(len(request.args) > 0):

			url_params = (api_url, year, election_type, election_round, cmn, ps, uvc, fs, mvc, mbb, mb, mvb, mul)
	
			search_url = '%s/search/%d/%s/%s/?commune=%s&polling-station=%s&ultra-violet-control=%s&finger-sprayed=%s&missing-voting-booth=%s&missing-ballot-box=%s&missing-ballots=%s&missing-poll-book=%s&missing-uv-lamp=%s' % url_params

			# Request the JSON Document from the URL Results
			search_result = requests.get(search_url).json()

		return render_template('search.html', directory_path=directory_path, polling_station_grouped_by_commune_dict=polling_station_grouped_by_commune_dict, search_result=search_result)



