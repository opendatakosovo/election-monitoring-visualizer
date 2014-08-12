from flask import render_template, request, redirect, url_for
from flask.views import View
from emv import mongo
from flask.ext.pymongo import PyMongo
from collections import OrderedDict
import pymongo

class Index(View):
	methods=['GET']
	def dispatch_request(self):
		polling_stations = mongo.db.localelectionsfirstround2013.find().sort([("pollingStation.commune", pymongo.ASCENDING), ("pollingStation.name", pymongo.ASCENDING), ("pollingStation.roomNumber", pymongo.ASCENDING)])

		polling_station_grouped_by_commune_dict = OrderedDict()

		for idx, polling_station in enumerate(polling_stations):

			# If first time we stumble on commune, create a dictionary entry for it.
			# The value for each dictionary entry is a set of election observations docs for this commune.
			if polling_station['pollingStation']['commune'] not in polling_station_grouped_by_commune_dict:
				polling_station_grouped_by_commune_dict[polling_station['pollingStation']['commune']] = [polling_station['pollingStation']['name']]

			else:
				# If not first time we stumble on commune, just add to the list of election observation document for that commune.
				# Don't add if we've already covered that polling station (based on the name of the polling station)
				if polling_station['pollingStation']['name'] not in polling_station_grouped_by_commune_dict[polling_station['pollingStation']['commune']]:

					if polling_station['pollingStation']['name'] != 'N/A': #FIXME: clean database for this case
						polling_station_grouped_by_commune_dict[polling_station['pollingStation']['commune']].append(polling_station['pollingStation']['name']) 

		return render_template('index.html', polling_station_grouped_by_commune_dict=polling_station_grouped_by_commune_dict)

