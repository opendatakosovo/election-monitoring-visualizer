from flask import render_template, request, redirect, url_for
from flask.views import View
from urllib2 import Request, urlopen, URLError
import json
from bson import json_util

class Commune(View):	
	methods = ['GET']
	def dispatch_request(self,commune):
		kdi_api_url = 'http://127.0.0.1:5001/api/kdi/observations'
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

		return render_template('observation.html', kvvMGD = kvvMGD, votesByHour = votes_by_hour)



