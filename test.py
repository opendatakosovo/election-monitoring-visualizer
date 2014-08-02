import csv

from pymongo import MongoClient
from bson import ObjectId
from utils import Utils

csv_filename = 'kdi-local-elections-observations-first-round-2013.csv'

# Connect to default local instance of mongo
client = MongoClient()

# Get database and collection
db = client.kdi
collection = db.localelectionsfirstround2013

# Clear data
collection.remove({})


obsByGender = collection.aggregate([{ "$match": { "pollingStation.commune":commune } },{"$group":{"_id":"$pollingStation.commune","Totali":{"$sum":"$preparation.votingMaterialsPlacedInAndOutVotingStation.kvvMembers.total"},"TotaliFemra":{"$sum":"$preparation.votingMaterialsPlacedInAndOutVotingStation.kvvMembers.female"}}}])
for obs in obsByGender:
	print obs
