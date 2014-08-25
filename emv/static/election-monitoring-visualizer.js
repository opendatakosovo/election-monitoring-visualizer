google.load("visualization", "1", {packages:["corechart", "columnchart", "table"]});	

// Visualize all data that we want to visualize
function visualizeData(communeSlug, pollingStationSlug){
	
	clearPreviouslyGeneratedDataVisualization();

	var url = '/observations' + window.location.pathname + "/" + communeSlug + '/' + pollingStationSlug

	$.get(url, function(data) {

		$.each(data, function(index, observation) {

			$("#dataVisualizationContainer").append('<div id="section-' + index + '"></div>');
	
			var roomNumer =  observation.pollingStation.roomNumber;
			drawSectionHeader(index, roomNumer);

			var voters = observation.votingProcess.voters.howManyVotedBy;
			drawHowManyVotedByBarChart(index, voters);

			var kvvMembers = observation.preparation.votingMaterialsPlacedInAndOutVotingStation.kvvMembers;
			drawKvvMembersPieChart(index, kvvMembers);			
			
			var irregularities = observation.irregularities;
			drawIrregularitiesTable(index, irregularities);

			var votingProcess = observation.votingProcess.voters;
			drawVotingProcessTable(index, votingProcess);

			var missingMaterial = observation.preparation.missingMaterial;
			drawMissingMaterialTable(index, missingMaterial);

		});	
	});
}

function visualizeSummaryData(voters, kvvMembers){
	clearPreviouslyGeneratedDataVisualization();
	var index = 0; // only one section when rendaring summary visualization.

	$("#dataVisualizationContainer").append('<div id="section-' + index + '"></div>');
	
	drawHowManyVotedByBarChart(index, voters);

	drawKvvMembersPieChart(index, kvvMembers);
}

function drawSectionHeader(index, roomNumber){
	var sectionDivId = 'section-' + index;
	var sectionHeaderDivId = 'header-' + index;
	var roomNumber = roomNumber.toUpperCase();

	$("#dataVisualizationContainer #section-" + index).append("<hr><div id='" + sectionDivId + "'><h3 id='" + sectionHeaderDivId + "'>Room " + roomNumber + "</h3></div>");

}

function drawHowManyVotedByBarChart(index, voters){
	var votersByTen = voters.tenAM;
	var votersByOne = voters.onePM;
	var votersByFour = voters.fourPM;
	var votersBySeven = voters.sevenPM;

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
		'is3D': true,
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
	var kvvMembersFemale = kvvMembers.female;

	// create div container for the pie chart
	// e.g. <div id="kvvMembersPieChart" style="width: 900px; height: 500px;"></div>
	var chartContainerDivId = 'kvvMembersPieChart-' + index;
	$("#dataVisualizationContainer #section-" + index).append("<div id='" + chartContainerDivId + "' style='width:50%'></div>");

	var kvvMembersMale = kvvMembersTotal - kvvMembersFemale;

	var data = google.visualization.arrayToDataTable([
		['Gender', 'Number'],
		['Male', kvvMembersMale],
		['Female', kvvMembersFemale]
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
		['Unauthorized person stayed at the polling station.', translateIrregularity(irregularities.unauthorizedPersonsStayedAtTheVotingStation)],
		['Allowed to vote.',  translateIrregularity(irregularities.allowedToVote)],
		['Photographed ballot.', translateIrregularity(irregularities.photographedBallot)],
		['Accidents during the voting process.',  translateIrregularity(irregularities.anyAccidentHappenedDuringTheProcess)],
		['Violence in the polling station.', translateIrregularity(irregularities.violenceInTheVotingStation)],
		['More than one person in the voting cabin.',  translateIrregularity(irregularities.moreThanOnePersonBehindTheCabin)],
		['More than one ballot inserted.', translateIrregularity(irregularities.insertedMoreThanOneBallot)],
		['Cases of closed polling station.',  translateIrregularity(irregularities.hasTheVotingStationBeenClosedInAnyCase)],
		['Political propaganda inside the voting station.',  translateIrregularity(irregularities.politicalPropagandaInsideTheVotingStation)],
		['Attempted to vote more than once.',  translateIrregularity(irregularities.attemptToVoteMoreThanOnce)]
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

function drawVotingProcessTable(index, votingProcess){
	
	var containerDivId = 'voting-process-' + index;
	var listId = 'voting-process-list-' + index;
	$("#dataVisualizationContainer #section-" + index).append("<div id='" + containerDivId + "'></div>");

	var ultraControl= votingProcess.ultraVioletControl;
	var fingerSprayed =votingProcess.fingerSprayed;
	var identifiedWithDocument = votingProcess.identifiedWithDocument;

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


function drawMissingMaterialTable(index, missingMaterial){
		
	var containerDivId = 'missing-material-' + index;
	var listId = 'missing-material-list-' + index;
	$("#dataVisualizationContainer #section-" + index).append("<div id='" + containerDivId + "'></div>");	

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
    data.addColumn('string', 'MissingMaterial');
    data.addColumn('boolean', 'Occured');
    data.addRows([
		['Ballot box.', ballotBox ],
		['Voters book.',  votersBook],
		['Spray.', spray],
		['Voters list.', votersList],
		['Envelopes for condition voters.', envelopsForConditionVoters],
		['UV lamp.', uvLamp],
		['Voting cabin.', votingCabin],
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

	var pollingStations = pollingStationGroupedByCommuneJson[communeSlug].pollingStations;

	$.each(pollingStations, function(index, obj) {
		$('#polling_station_select')
			.append($("<option></option>")
			.attr("value", obj.slug)
			.text(obj.name)); 
	});

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
