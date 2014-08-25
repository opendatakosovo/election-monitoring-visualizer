google.load("visualization", "1", {packages:["corechart", "table"]});	


function drawSectionHeader(index, roomNumber){
	var containerDivId = 'sectionHeader-' + index;
	$("#dataVisualizationContainer").append("<h2 id='" + containerDivId + "'>Room " + roomNumber + ":</h2>");
}

// Draw the KVV members gender distribution pit chart
function drawKvvMembersPieChart(index, kvvMembers){
	var kvvMembersTotal = kvvMembers.total;
	var kvvMembersFemale = kvvMembers.female;

	// create div container for the pie chart
	// e.g. <div id="kvvMembersPieChart" style="width: 900px; height: 500px;"></div>
	var chartContainerDivId = 'kvvMembersPieChart-' + index;
	$("#dataVisualizationContainer").append("<div id='" + chartContainerDivId + "'  class='kvvMembersPieChart'></div>");

	var kvvMembersMale = kvvMembersTotal - kvvMembersFemale;

	var data = google.visualization.arrayToDataTable([
		['Gender', 'Number'],
		['Male', kvvMembersMale],
		['Female', kvvMembersFemale]
	]);

	var options = {
	  	title: 'Gender Distribution of KVV Members',
		is3D: true,
	};

	var chart = new google.visualization.PieChart(document.getElementById(chartContainerDivId));
	chart.draw(data, options);
}

// Draw election process irregularities table
function drawIrregularitiesTable(index, irregularities){

	var chartContainerDivId = 'irregularities-' + index;
	$("#dataVisualizationContainer").append("<div class='tables'>").append("<div id='" + chartContainerDivId + "' class='irregularities'></div>");

    var data = new google.visualization.DataTable();
    data.addColumn('string', 'Irregularity');
    data.addColumn('boolean', 'Occured');
    data.addRows([
		['Unauthorized person stayed at the polling station', translateIrregularity(irregularities.unauthorizedPersonsStayedAtTheVotingStation)],
		['Allowed to vote',  translateIrregularity(irregularities.allowedToVote)],
		['Photographed ballot', translateIrregularity(irregularities.photographedBallot)],
		['Accidents during the voting process',  translateIrregularity(irregularities.anyAccidentHappenedDuringTheProcess)],
		['Violence in the polling station', translateIrregularity(irregularities.violenceInTheVotingStation)],
		['More than one person the the voting cabin',  translateIrregularity(irregularities.moreThanOnePersonBehindTheCabin)],
		['More than one ballot inserted', translateIrregularity(irregularities.insertedMoreThanOneBallot)],
		['Cases of closed polling station',  translateIrregularity(irregularities.hasTheVotingStationBeenClosedInAnyCase)],
		['Political propaganda inside the voting station',  translateIrregularity(irregularities.politicalPropagandaInsideTheVotingStation)],
		['Attempted to vote more than once',  translateIrregularity(irregularities.attemptToVoteMoreThanOnce)]
    ]);

	var options = {
	};


	//FIXME: what about caseVotingOutsideTheCabin?

    var table = new google.visualization.Table(document.getElementById(chartContainerDivId));
    table.draw(data, options);
}

function translateIrregularity(irregularity){
	if(irregularity == "N/A"){
		return false;
	}
	else if(irregularity == true){
		return true;
	}else{
		return false;
	}

}

function drawHowManyVotedByBarChart(index,voters){
	var votersByTen = voters.tenAM;
	var votersByOne = voters.onePM;
	var votersByFour = voters.fourPM;
	var votersBySeven = voters.sevenPM;

	// create div container for the bar chart
	var chartContainerDivId = 'votersByHourBarChart-' + index;
	$("#dataVisualizationContainer").append("<div id='" + chartContainerDivId + "'  class='votersByHourBarChart'></div>");

	var data = google.visualization.arrayToDataTable([
		['Hour', 'Value',{ role: "style" }],
		['10:00', votersByTen,"silver" ],
		['13:00', votersByOne,"#b87333"],
		['16:00', votersByFour,"gold"],
		['19:00', votersBySeven,"color: #e5e4e2"]
	]);
	var view = new google.visualization.DataView(data);
      view.setColumns([0, 1,
                       { calc: "stringify",
                         sourceColumn: 1,
                         type: "string",
                         role: "annotation" },
                       2]);

	var options = {
	  	title: 'Ballots Casted For Given Hours',
		is3D: true,
		bar: {groupWidth: "95%"},
        legend: { position: "none" },
	};
	

	var chart = new google.visualization.ColumnChart(document.getElementById(chartContainerDivId));
	chart.draw(data, options);
}

function drawVotingProcessTable(index, votingProcess){
	

	var chartContainerDivId = 'votingProcess-' + index;
	$("#dataVisualizationContainer").append("<div id='" + chartContainerDivId + "' class='votingProcess'></div>");

	var ultraControl= votingProcess.ultraVioletControl;
	var fingerSprayed =votingProcess.fingerSprayed;
	var identifiedWithDocument = votingProcess.identifiedWithDocument;


    var data = new google.visualization.DataTable();
    data.addColumn('string', 'VotingProcess');
    data.addColumn('string', 'Occured');
    data.addRows([
		['Ultra Violet Control', ultraControl ],
		['Finger Sprayed',  fingerSprayed],
		['Identifed with Document ID', identifiedWithDocument]
		
    ]);

	var options = {
	};


	//FIXME: what about sealedBallot?

    var table = new google.visualization.Table(document.getElementById(chartContainerDivId));
    table.draw(data, options);
}

function drawMissingMaterialTable(index, missingMaterial){
		

	var chartContainerDivId = 'missingMaterial-' + index;
	$("#dataVisualizationContainer").append("<div id='" + chartContainerDivId + "' class='missingMaterial'></div>");
	
	var ballotBox = missingMaterial.ballotBox;
	var votersBook = missingMaterial.votersBook;
	var spray = missingMaterial.spray;
	var votersList = missingMaterial.votersList;
	var envelopsForConditionVoters = missingMaterial.envelopsForConditionVoters;
	var uvLamp = missingMaterial.uvLamp;
	var votingCabin = missingMaterial.votingCabin;
	var stamp = missingMaterial.stamp;
	var ballots = missingMaterial.ballots;

    var data = new google.visualization.DataTable();
    data.addColumn('string', 'Missing Material');
    data.addColumn('boolean', 'Occured');
    data.addRows([
		['Ballot Box', ballotBox ],
		['Voters Book',  votersBook],
		['Spray', spray],
		['Voters List', votersList],
		['Envelopes for Condition Voters', envelopsForConditionVoters],
		['UV Lamp', uvLamp],
		['Voting Cabin', votingCabin],
		['Stamp', stamp],
		['Ballots', ballots]
		
    ]);

	var options = {
	  	width: '450px'
	};



    var table = new google.visualization.Table(document.getElementById(chartContainerDivId));
    table.draw(data, options);
}
 
// Initialize polling station name dropdown list
function initPollingStationDropdown(communeSlug){

	// First clear the polling station drowpown list
	$('#polling_station_select option').remove();

	var pollingStations = pollingStationGroupedByCommuneJson[communeSlug].pollingStations;

	$.each(pollingStations, function(index, obj) {
		$('#polling_station_select')
			.append($("<option></option>")
			.attr("value", obj.slug)
			.text(obj.name)); 
	});

	// init data visualization with default data selected
	var communeSlug = $('#commune_select').find(":selected").val();
	var pollingStationSlug = $('#polling_station_select').find(":selected").val();
		
	visualizeData(communeSlug, pollingStationSlug);
}

// Visualize all data that we want to visualize
function visualizeData(communeSlug, pollingStationSlug){
	
	clearPreviouslyGeneratedDataVisualization();

	var url = '/observations' + window.location.pathname + "/" + communeSlug + '/' + pollingStationSlug

	$.get(url, function(data) {

		$.each(data, function(index, observation) {
	
			var kvvMembers = observation.preparation.votingMaterialsPlacedInAndOutVotingStation.kvvMembers;
			drawKvvMembersPieChart(index, kvvMembers);

			var roomNumer =  observation.pollingStation.roomNumber;
			drawSectionHeader(index, roomNumer);

			var voters = observation.votingProcess.voters.howManyVotedBy;
			drawHowManyVotedByBarChart(index, voters);
			
			var irregularities = observation.irregularities;
			drawIrregularitiesTable(index, irregularities);

			var votingProcess= observation.votingProcess.voters;
			drawVotingProcessTable(index, votingProcess);

			var missingMaterial= observation.preparation.missingMaterial;
			drawMissingMaterialTable(index, missingMaterial); 
			
		});
		
	});
}

function clearPreviouslyGeneratedDataVisualization(){
	$("#appInfoContainer").html('');
	$("#dataVisualizationContainer").empty();
}

$(document).ready(function(){

	pollingStationDataRetrieved = false;

	// Initialize commune name dropdown list.
	// index is the name of the commune.
	// value is the name of the polling stations.
	$.each(pollingStationGroupedByCommuneJson, function(idx, value) {
		$('#commune_select')
			.append($("<option></option>")
			.attr("value", idx)
			.text(value.name)); 

		pollingStationDataRetrieved = true;
	});

	if(pollingStationDataRetrieved){
		// Initialize polling station name dropdown listin relation to default commune name.
		initPollingStationDropdown($('#commune_select').find(":selected").val());

		// When new communue is selected, re-initialize the polling station name dropdown list.
		$('#commune_select').change(function(){
			initPollingStationDropdown($(this).val())
		});

		// When new polling station is selected, open new window that presents data.
		$('#polling_station_select').change(function(){

			var communeSlug = $('#commune_select').find(":selected").val();
			var pollingStationSlug = $('#polling_station_select').find(":selected").val();
		
			visualizeData(communeSlug, pollingStationSlug);
		});
	}else{
		//TODO: Hide dropdowns
	}
});
