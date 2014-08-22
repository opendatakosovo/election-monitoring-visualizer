import app

class Utils(object):

	def __init__(self):
		pass

	def get_api_url(self, observer):
		''' Generate API URL for given observer.
		:param observer: a string identifying the election monitoring organization.
		'''
		api_domain = app.config['API_KDI']
		api_url = '%s/api/%s/observations' % (api_domain, observer)

		return api_url
