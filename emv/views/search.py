from flask import render_template, request, redirect, url_for
from flask.views import View
from urllib2 import Request, urlopen, URLError
import json
from bson import json_util
import requests
from flask import Blueprint
from flask.ext.paginate import Pagination
from emv import utils

mod = Blueprint('searchResults', __name__)

class Search(View):	
	methods=['GET']

	def dispatch_request(self):
		error=None
		#Test if the method is GET
		if request.method =='GET':		
			#Pass the values to the API
			api_url = utils.get_api_url('kdi')

			cmn = request.args.get('commune')
			ps = request.args.get('pollingStation')
			uvc = request.args.get('ultraVioletControl')
			fs = request.args.get('fingerSprayed')

			url_params = (api_url, cmn, ps, uvc, fs)

			url = '%s/search/2013/local-elections/first-round/?commune=%s&pollingStation=%s&ultraVioletControl=%s&fingerSprayed=%s' % url_params


			# Request the JSON Document from the URL Results
			searchResults= requests.get(url).json()

		ITEMS_PER_PAGE = 10
		
		search = False

		q = request.args.get('q')

		if q:
		    search = True
		try:
			page = int(request.args.get('page', 1))
		except ValueError:

			page = 1

		scount=0

		for searchCount in searchResults:
			scount+=1

		pagination = Pagination(total=scount, page=page, search=False, record_name='search', per_page=ITEMS_PER_PAGE, alignment="centered")


		return render_template('search.html', error=error, searchResults=searchResults, search=search, pagination=pagination)



