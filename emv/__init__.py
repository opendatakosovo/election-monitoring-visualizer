import os
import ConfigParser


from flask import Flask
from flask.views import View
from flask.ext.pymongo import PyMongo


# Create MongoDB database object.
mongo = PyMongo()

def create_app():
	''' Create the Flask app.
	'''
	# Create the Flask app.
	app = Flask(__name__)

	# Load application configurations
	load_config(app)

	# Register URL rules.
	register_url_rules(app)

	# Init app for use with this PyMongo
	# http://flask-pymongo.readthedocs.org/en/latest/#flask_pymongo.PyMongo.init_app
	mongo.init_app(app, config_prefix='MONGO')

	return app

	
def load_config(app):
	''' Reads the config file and loads configuration properties into the Flask app.
	:param app: The Flask app object.
	'''

	# Get the path to the application directory, that's where the config file resides.
	par_dir = os.path.join(__file__, os.pardir)
	par_dir_abs_path = os.path.abspath(par_dir)
	app_dir = os.path.dirname(par_dir_abs_path)

	# Read config file
	# FIXME: Use the "common pattern" described in "Configuring from Files": http://flask.pocoo.org/docs/config/
	config = ConfigParser.RawConfigParser()
	config_filepath = app_dir + '/config.cfg'
	config.read(config_filepath)

	# Set up config properties
	app.config['SERVER_PORT'] = config.get('Application', 'SERVER_PORT')

	app.config['MONGO_DBNAME'] = config.get('Mongo', 'DB_NAME')

	# Logging path might be relative or starts from the root.
	# If it's relative then be sure to prepend the path with the application's root directory path.




# Import forms
from views.index import Index
from views.search import Search
from views.polling_station import PollingStation
from views.commune import Commune
from views.room_number import RoomNumber
from views.obsapi import ObservationsApi

def register_url_rules(app):
	''' Register the URL rules. 
		Use pluggable class-based views: http://flask.pocoo.org/docs/views/
	:param app: The Flask application instance.
	''' 
	# Index page form.
	app.add_url_rule('/', view_func=Index.as_view('index'))

	# Search for specific commune or polling station observations.
	app.add_url_rule('/search/', view_func=Search.as_view('search'))

	# Search api for specific commune or polling station observations.
	app.add_url_rule('/api/observations/<string:commune>/<string:polling_station_name>', view_func=Search.as_view('obsapi'))

	# Show observations for specific commune,pollingStationName or roomNumber
	app.add_url_rule('/observations/<string:commune>', view_func=Commune.as_view('commune'),methods=['GET'])
	app.add_url_rule('/observations/<string:commune>/<string:polling_station_name>', view_func=PollingStation.as_view('polling_station_name'),methods=['GET'])
	app.add_url_rule('/observations/<string:commune>/<string:polling_station_name>/<string:room_number>/', view_func=RoomNumber.as_view('room_number'),methods=['GET'])
