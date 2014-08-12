from flask import render_template, request, redirect, url_for
from flask.views import View
from urllib2 import Request, urlopen, URLError
import json
from bson import json_util
import requests

class Search(View):	
	methods=['GET']
	def dispatch_request(self):
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
