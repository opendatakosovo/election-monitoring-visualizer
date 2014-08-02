from flask import Flask, request, render_template, Response
from flask.ext.pymongo import PyMongo
from flask import request
import pymongo
from collections import OrderedDict
from bson import json_util
from bson.son import SON

app = Flask(__name__)
app.debug = True

# connect to MongoDB database
app.config['MONGO_DBNAME'] = 'kdi'
mongo = PyMongo(app, config_prefix='MONGO')

@app.route('/')
def index():

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

@app.route('/observation/<string:commune>/<string:polling_station_name>', methods=['GET'])
def observation(commune, polling_station_name):

	#Calculating Votes By Hour(fetching from MongoDB)
	observations = mongo.db.localelectionsfirstround2013.aggregate([{ "$match": { "pollingStation.name":polling_station_name } }, {'$group':{'_id':'$pollingStation.commune','tenAM':{'$sum':'$votingProcess.voters.howManyVotedBy.tenAM'},'onePM':{'$sum':'$votingProcess.voters.howManyVotedBy.onePM'},'fourPM':{'$sum':'$votingProcess.voters.howManyVotedBy.fourPM'},'sevenPM':{'$sum':'$votingProcess.voters.howManyVotedBy.sevenPM'}}}])
	tenAM=0
	onePM=0
	fourPM=0
	sevenPM=0

	for observation in observations['result']:
		tenAM = observation['tenAM']	
		onePM = observation['onePM']
		fourPM = observation['fourPM']
		sevenPM =observation['sevenPM']
	
	#Observators in PollingStation, distributed by gender(fetching from MongoDB)
	observations = mongo.db.localelectionsfirstround2013.find({'pollingStation.commune': commune, 'pollingStation.name': polling_station_name})


	obsByGender = mongo.db.localelectionsfirstround2013.aggregate([{ "$match": { "pollingStation.name":polling_station_name } }, {'$group':{'_id':'$pollingStation.name','Totali':{'$sum':'$preparation.votingMaterialsPlacedInAndOutVotingStation.kvvMembers.total'},'TotaliFemra':{'$sum':'$preparation.votingMaterialsPlacedInAndOutVotingStation.kvvMembers.female'}}}])
	total=0	
	female=0
	male=0
	for o in obsByGender['result']:
		total=o['Totali']
		female=o['TotaliFemra']
	male=total-female
	return render_template('observation.html',male=male,total=total,female=female,tenAM=tenAM,onePM=onePM,fourPM=fourPM,sevenPM=sevenPM)

@app.route('/api/observations/<string:commune>/<string:polling_station_name>', methods=['GET'])
def get_observations(commune, polling_station_name):
	observations = mongo.db.localelectionsfirstround2013.find({'pollingStation.commune': commune, 'pollingStation.name': polling_station_name})
	
	resp = Response(response=json_util.dumps(observations), mimetype='application/json')

	return resp

@app.route('/observation/<string:commune>/', methods=['GET'])
def observations(commune):

	#Calculating VotesByHour (fetching from MongoDB)
	observations = mongo.db.localelectionsfirstround2013.aggregate([{ "$match": { "pollingStation.commune":commune } }, {'$group':{'_id':'$pollingStation.commune','tenAM':{'$sum':'$votingProcess.voters.howManyVotedBy.tenAM'},'onePM':{'$sum':'$votingProcess.voters.howManyVotedBy.onePM'},'fourPM':{'$sum':'$votingProcess.voters.howManyVotedBy.fourPM'},'sevenPM':{'$sum':'$votingProcess.voters.howManyVotedBy.sevenPM'}}}])
	tenAM=0
	onePM=0
	fourPM=0
	sevenPM=0

	for observation in observations['result']:
		tenAM = observation['tenAM']	
		onePM = observation['onePM']
		fourPM = observation['fourPM']
		sevenPM =observation['sevenPM']

	#Observators in PollingStation, distributed by gender(fetching from MongoDB)
	obsByGender = mongo.db.localelectionsfirstround2013.aggregate([{ "$match": { "pollingStation.commune":commune } }, {'$group':{'_id':'$pollingStation.commune','Totali':{'$sum':'$preparation.votingMaterialsPlacedInAndOutVotingStation.kvvMembers.total'},'TotaliFemra':{'$sum':'$preparation.votingMaterialsPlacedInAndOutVotingStation.kvvMembers.female'}}}])
	
	total=0	
	female=0
	male=0
	
	for o in obsByGender['result']:
		total=o['Totali']
		female=o['TotaliFemra']
	male=total-female


	return render_template('observation.html',total=total,male=male,female=female,tenAM=tenAM,onePM=onePM,fourPM=fourPM,sevenPM=sevenPM)


@app.route('/search/', methods=['POST', 'GET'])
def login():
		error = None
		commune = request.args.get('commune', '')
		unauthorizedAtVotingStation=request.args.get('unauthorizedAtVotingStation', '')
		allowedToVote = request.args.get('allowedToVote', '')
		photographedBallot = request.args.get('photographedBallot', '')
		cursor=mongo.db.localelectionsfirstround2013.find({ "$and": [ {"pollingStation.commune":commune},{ "irregularities.unauthorizedPersonsStayedAtTheVotingStation" : unauthorizedAtVotingStation }, { "irregularities.allowedToVote": allowedToVote},{"irregularities.photographedBallot":photographedBallot}] })
    

		# the code below is executed if the request method
   	 	# was GET or the credentials were invalid

		return render_template('search.html', error=error,commune=commune,unauthorizedAtVotingStation=unauthorizedAtVotingStation,allowedToVote=allowedToVote,photographedBallot=photographedBallot,cursor=cursor)

if __name__ == '__main__':
	app.run()
