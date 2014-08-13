from flask import render_template, request, redirect, url_for, Response
from flask.views import MethodView
from emv import mongo
from flask.ext.pymongo import PyMongo
from collections import OrderedDict
import pymongo
from bson import json_util
import json

class ObservationsApi(MethodView):
	methods=['GET']
	def dispatch_request(self,commune, polling_station_name):
		observations = mongo.db.localelectionsfirstround2013.find({'pollingStation.commune': commune, 'pollingStation.name': polling_station_name})
	
		resp = Response(response=json_util.dumps(observations), mimetype='application/json')

		return resp
