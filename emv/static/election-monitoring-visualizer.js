google.load("visualization", "1", {packages:["corechart", "columnchart", "table"]});	

// Visualize all data that we want to visualize
function visualizeData(communeSlug, pollingStationSlug){
	
	clearPreviouslyGeneratedDataVisualization();

	var url = basePath + "/observations" + window.location.pathname.replace(basePath, '') + "/" + communeSlug + '/' + pollingStationSlug

	$.get(url, function(data) {

		$.each(data, function(index, observation) {

			$("#dataVisualizationContainer").append('<div id="section-' + index + '"></div>');
	
			var stationNumber =  observation.votingCenter.stationNumber;
			drawSectionHeader(index, stationNumber);

			var howManyVotedBy = observation.voting.process.voters.howManyVotedBy;
			drawHowManyVotedByBarChart(index, howManyVotedBy);

			var pscMembers = observation.preparation.pscMembers;
			drawKvvMembersPieChart(index, pscMembers);			
			
			var irregularities = observation.voting.irregularities;
			drawIrregularitiesTable(index, irregularities);

			var votingProcessVoters = observation.votingProcess.voters;
			drawVotingProcessTable(index, votingProcessVoters);

			var missingMaterials = observation.preparation.missingMaterials;
			drawMissingMaterialTable(index, missingMaterials);

		});	
	});
}

function visualizeSummaryData(title, voters, kvvMembers){
	clearPreviouslyGeneratedDataVisualization();
	var index = 0; // only one section when rendering summary visualization.

	$("#dataVisualizationContainer").append('<div id="section-' + index + '"><h3><em>' + title + '</em></h3></div>');
	
	drawHowManyVotedByBarChart(index, voters);
	if(kvvMembers != undefined){
		drawKvvMembersPieChart(index, kvvMembers);
	}
}

function drawSectionHeader(index, roomNumber){
	var sectionDivId = 'section-' + index;
	var sectionHeaderDivId = 'header-' + index;
	var roomNumber = roomNumber.toUpperCase();

	$("#dataVisualizationContainer #section-" + index).append("<hr><div id='" + sectionDivId + "'><h3 id='" + sectionHeaderDivId + "'>Room " + roomNumber + "</h3></div>");

}

function drawHowManyVotedByBarChart(index, howManyVotedBy){
	var votersByTen = howManyVotedBy.tenAM;
	var votersByOne = howManyVotedBy.onePM;
	var votersByFour = howManyVotedBy.fourPM;
	var votersBySeven = howManyVotedBy.sevenPM;

	// create div container for the bar chart
	var chartContainerDivId = 'votersByHourBarChart-' + index;
	$("#dataVisualizationContainer #section-" + index).append("<div id='" + chartContainerDivId + "'></div>");

	var data = google.visualization.arrayToDataTable([
		['Hour', 'Value',{ role: "style" }],
		['10:00', votersByTen, "pink" ],
		['13:00', votersByOne, "#b87333"],
		['16:00', votersByFour, "gold"],
		['19:00', votersBySeven, "green"]
	]);
	var view = new google.visualization.DataView(data);
      view.setColumns([0, 1,
                       { calc: "stringify",
                         sourceColumn: 1,
                         type: "string",
                         role: "annotation" },
                       2]);

	var options = {
	  	'title': 'Ballots Casted For Given Hours',
		'bar': {groupWidth: "95%"},
        'legend': { position: "none" },
  		'height':700,
		'width':600
	};
	

	var chart = new google.visualization.ColumnChart(document.getElementById(chartContainerDivId));
	chart.draw(data, options);
}

// Draw the KVV members gender distribution pit chart
function drawKvvMembersPieChart(index, kvvMembers){
	var kvvMembersTotal = kvvMembers.total;
	var kvvMembersWomen = kvvMembers.women;

	// create div container for the pie chart
	// e.g. <div id="kvvMembersPieChart" style="width: 900px; height: 500px;"></div>
	var chartContainerDivId = 'kvvMembersPieChart-' + index;
	$("#dataVisualizationContainer #section-" + index).append("<div id='" + chartContainerDivId + "' style='width:50%'></div>");

	var kvvMembersMale = kvvMembersTotal - kvvMembersWomen;

	var data = google.visualization.arrayToDataTable([
		['Gender', 'Number'],
		['Male', kvvMembersMale],
		['Female', kvvMembersWomen]
	]);

	var options = {
	  	'title': 'Gender Distribution of KVV Members',
		'is3D': true,
  		'height':400,
		'width':800
	};

	var chart = new google.visualization.PieChart(document.getElementById(chartContainerDivId));
	chart.draw(data, options);
}

// Draw election process irregularities table
function drawIrregularitiesTable(index, irregularities){

	// Create the containers.
	var containerDivId = 'irregularities-' + index;
	var listId = 'irregularity-list-' + index;
	$("#dataVisualizationContainer #section-" + index).append("<div id='" + containerDivId + "'></div>");

	// Create the data table.
    var data = new google.visualization.DataTable();
    data.addColumn('string', 'Irregularity');
    data.addColumn('boolean', 'Occured');
    data.addRows([
		['Unauthorized person stayed at the polling station.', translateIrregularity(irregularities.unauthorizedPersonsStayedInPollingStation)],
		['Photographed ballot.', translateIrregularity(irregularities.photographedBallot)],
		['Incidents during the voting process.',  translateIrregularity(irregularities.incidents)],
		['Violence or threats in the polling station.', translateIrregularity(irregularities.violenceOrThreats)],
		['More than one person in the voting booth (family voting).',  translateIrregularity(irregularities.moreThanOnePersonBehindTheBooth)],
		['More than one ballot inserted.', translateIrregularity(irregularities.personInsertedMoreThanOneBallot)],
		['Polling station closed at some point during the day.',  translateIrregularity(irregularities.pollingStationClosedAtAnyPointDuringDay)],
		['Political propaganda inside the voting station.',  translateIrregularity(irregularities.politicalPropagandaInsideThePollingStation)],
		['Attempt to vote more than once.',  translateIrregularity(irregularities.anyoneTriedToVoteMoreThanOnce.attempted)]
    ]);

	renderListOfObservedYesNoIssues(data, containerDivId, listId, 'Irregularities:');

}

//#FIXME: data should be sanitized so that we don't have to do this.
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

function drawVotingProcessTable(index, votingProcessVoters){
	
	var containerDivId = 'voting-process-' + index;
	var listId = 'voting-process-list-' + index;
	$("#dataVisualizationContainer #section-" + index).append("<div id='" + containerDivId + "'></div>");

	var ultraControl = votingProcessVoters.ultraVioletControl;
	var fingerSprayed = votingProcessVoters.fingerSprayed;
	var identifiedWithDocument = votingProcessVoters.identifiedWithDocument;

    var data = new google.visualization.DataTable();
    data.addColumn('string', 'VotingProcess');
    data.addColumn('string', 'Occured');
    data.addRows([
		['Ultra Violet Control.', ultraControl ],
		['Finger Sprayed.',  fingerSprayed],
		['Identifed with Document ID.', identifiedWithDocument]
		
    ]);

	renderListOfObservedFrequencyIssues(data, containerDivId, listId, 'Control Flaws:');

}


function drawMissingMaterialTable(index, missingMaterials){
		
	var containerDivId = 'missing-material-' + index;
	var listId = 'missing-material-list-' + index;
	$("#dataVisualizationContainer #section-" + index).append("<div id='" + containerDivId + "'></div>");	

	var ballotBox = missingMaterials.ballotBox;
	var pollBook = missingMaterials.pollBook;
	var invisibleInk = missingMaterials.invisibleInk;
	var votersList = missingMaterials.votersList;
	var envelopesForConditionalVote = missingMaterials.envelopesForConditionalVote;
	var uvLamp = missingMaterials.uvLamp;
	var votingBooth = missingMaterials.votingBooth;
	var stamp = missingMaterials.stamp;
	var ballots = missingMaterials.ballots;

    var data = new google.visualization.DataTable();
    data.addColumn('string', 'MissingMaterial');
    data.addColumn('boolean', 'Occured');
    data.addRows([
		['Ballot box.', ballotBox ],
		['Poll book.',  pollBook],
		['Invisible ink.', invisibleInk],
		['Voter\'s list.', votersList],
		['Envelopes for conditional vote.', envelopesForConditionalVote],
		['UV lamp.', uvLamp],
		['Voting booth.', votingBooth],
		['Stamp.', stamp],
		['Ballots.', ballots]
		
    ]);

	renderListOfObservedYesNoIssues(data, containerDivId, listId, 'Missing Materials:');
}

function renderListOfObservedYesNoIssues(data, containerDivId, listId, title){
	// Loop the data table and list the irregularities that are true.
	var atLeastOneItem = false;

	for(var i = 0; i < data.getNumberOfRows(); i++){
		var val = data.getValue(i, 1);
		if(val == true){
		
			// Render list header and list container.
			if(atLeastOneItem == false){
				$('#' + containerDivId).append('<strong>' + title + '</strong>');
				$('#' + containerDivId).append("<ul id='" + listId +"'></ul>");
				
				atLeastOneItem = true;			
			}

			// Add issue to the list.
			var issue = data.getValue(i, 0);
			$("#" + listId).append('<li>' + issue + '</li>');
		}
	}
}

function renderListOfObservedFrequencyIssues(data, containerDivId, listId, title){
	// Loop the data table and list the irregularities that are true.
	var atLeastOneItem = false;

	for(var i = 0; i < data.getNumberOfRows(); i++){
		var val = data.getValue(i, 1);
		if(val != 'always'){
		
			// Render list header and list container.
			if(atLeastOneItem == false){
				$('#' + containerDivId).append('<strong>' + title + '</strong>');
				$('#' + containerDivId).append("<ul id='" + listId +"'></ul>");
				
				atLeastOneItem = true;			
			}

			// Add item to the list.
			var issue = data.getValue(i, 0);
			capitalizedVal = capitaliseFirstLetter(val);
			$("#" + listId).append('<li>' + capitalizedVal + ' ' + issue + '</li>');
		}
	}
}

function capitaliseFirstLetter(string)
{
    return string.charAt(0).toUpperCase() + string.slice(1);
}
 
// Initialize polling station name dropdown list
function initPollingStationDropdown(communeSlug){

	// First clear the polling station drowpown list
	$('#polling_station_select option').remove();

	var pollingStations = pollingStationGroupedByCommuneJson[communeSlug].votingCenters;

	$.each(pollingStations, function(index, obj) {
		$('#polling_station_select')
			.append($("<option></option>")
			.attr("value", obj.slug)
			.text(obj.name)); 
	});

}

function initVisualizeData(){
	// Get commune and polling station slugs
	var communeSlug = $('#commune_select').find(":selected").val();
	var pollingStationSlug = $('#polling_station_select').find(":selected").val();

	// Set the href for the commune and polling station summary pages.
	setCommuneSummaryPageUrl(communeSlug);
	setPollingStationSummaryPageUrl(communeSlug, pollingStationSlug)
		
	// init data visualization with default data selected
	visualizeData(communeSlug, pollingStationSlug);
}

function setCommuneSummaryPageUrl(communeSlug){
	var communeUrl = window.location.pathname + "/" + communeSlug
	$('#commune-summary-link').attr('href', communeUrl);
}

function setPollingStationSummaryPageUrl(communeSlug, pollingStationSlug){
	var pollingStationUrl = window.location.pathname + "/" + communeSlug + '/' + pollingStationSlug
	$('#polling-station-summary-link').attr('href', pollingStationUrl);
}


function clearPreviouslyGeneratedDataVisualization(){
	$("#appInfoContainer").html('');
	$("#dataVisualizationContainer").empty();
}
