from flask import current_app

class Utils(object):

	def __init__(self):
		pass

	def get_api_url(self, observer):
		''' Generate API URL for given observer.
		:param observer: a string identifying the election monitoring organization.
		'''
		api_domain = current_app.config['API_KDI']
		api_url = '%s/%s' % (api_domain, observer)

		return api_url

	def get_collection_name(self, year, election_type, election_round):
		''' Build String with value set to the collection name
		
		:param year: The year of the election
		:param election_type: The type of the election. Can be local (local-elections) or general (general-elections)
		:param election_round: The round of the election (e.g. first-round, second-round...)
		'''
		
		election_type = election_type.replace('-', '')
		election_round = election_round.replace('-', '')
		
		collection_name = election_type + election_round + str(year)
		
		return collection_name
