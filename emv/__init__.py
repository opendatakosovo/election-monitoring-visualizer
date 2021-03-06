import os
import ConfigParser
import logging
import logging.config

from logging.handlers import RotatingFileHandler

from flask import Flask
from flask.views import View

from utils.utils import Utils

# Create utils instance.
utils = Utils()

def create_app():
	''' Create the Flask app.
	'''
	# Create the Flask app.
	app = Flask(__name__)

	# Load application configurations
	load_config(app)

	# Configure logging.
	configure_logging(app)

	# Register URL rules.
	register_url_rules(app)

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
	app.config['BASE_PATH'] = config.get('Application', 'BASE_PATH')

	app.config['API_ELECTION_MONITORING'] = config.get('Api', 'ELECTION_MONITORING')

	# Logging path might be relative or starts from the root.
	# If it's relative then be sure to prepend the path with the application's root directory path.
	log_path = config.get('Logging', 'PATH')
	if log_path.startswith('/'):
		app.config['LOG_PATH'] = log_path
	else:
		app.config['LOG_PATH'] = app_dir + '/' + log_path

	app.config['LOG_LEVEL'] = config.get('Logging', 'LEVEL').upper()

def configure_logging(app):
	
	# Get the path of the log from the config
	log_path = app.config['LOG_PATH']
	
	# Get the level of logging from the config
	log_level = app.config['LOG_LEVEL']

	# If path directory doesn't exist, create it.
	log_dir = os.path.dirname(log_path)
	if not os.path.exists(log_dir):
		os.makedirs(log_dir)

	# Create formatter
	formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
	
	# Create Log_Handler
	log_handler = RotatingFileHandler(log_path, maxBytes=250000, backupCount=5)

	# add formatter to log handler
	log_handler.setFormatter(formatter)

	# Get the level of the Debug and set it to the logger
	app.logger.setLevel(log_level)

	# Add the handlers to the logger
	app.logger.addHandler(log_handler)
	
	# Test if the logging is working by typing this string to a file.
	app.logger.info('Logging to: %s', log_path)
	

# Import forms
from views.index import Index
from views.search import Search
from views.polling_station import PollingStation
from views.commune import Commune
from views.room_number import RoomNumber
from views.observation import Observation

def register_url_rules(app):
	''' Register the URL rules. 
		Use pluggable class-based views: http://flask.pocoo.org/docs/views/
	:param app: The Flask application instance.
	''' 

	''' 
		JSON request URLs.
	'''
	# Get observations JSON for specified commune or polling station.
	app.add_url_rule('/observations/<string:observer>/<int:year>/<string:election_type>/<string:election_round>/<string:commune_slug>/<string:polling_station_slug>', view_func=Observation.as_view('observations'))

	''' 
		Template Loading URLs.
	'''
	# Show Index page.
	app.add_url_rule('/', view_func=Index.as_view('index'))

	# Show index page until all required URL directories are given to fetch observations.
	app.add_url_rule('/<string:observer>', view_func=Index.as_view('index_observer'))
	app.add_url_rule('/<string:observer>/<int:year>', view_func=Index.as_view('index_year'))
	app.add_url_rule('/<string:observer>/<int:year>/<string:election_type>', view_func=Index.as_view('index_election_type'))
	app.add_url_rule('/<string:observer>/<int:year>/<string:election_type>/<string:election_round>', view_func=Index.as_view('index_election_round'))

	# Search for specific commune or polling station observations.
	app.add_url_rule('/<string:observer>/<int:year>/<string:election_type>/<string:election_round>/search', view_func=Search.as_view('search'))

	# Show observations for specified commune.
	app.add_url_rule('/<string:observer>/<int:year>/<string:election_type>/<string:election_round>/<string:commune_slug>', view_func=Commune.as_view('commune'))

	# Show observations for specified commune and polling station name.
	app.add_url_rule('/<string:observer>/<int:year>/<string:election_type>/<string:election_round>/<string:commune_slug>/<string:polling_station_slug>', view_func=PollingStation.as_view('polling_station'))

	# Show observations for specified commune, polling station name, and room number.
	app.add_url_rule('/<string:observer>/<int:year>/<string:election_type>/<string:election_round>/<string:commune_slug>/<string:polling_station_slug>/<string:room_number>', view_func=RoomNumber.as_view('room_number'))

