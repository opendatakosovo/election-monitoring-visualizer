google.load("visualization", "1", {packages:["corechart", "table"]});	

function drawPollingStationInfo(pollingStation){
	$("#dataVisualizationContainer").append("<h1 id='pollingStationInfo'>Observations for polling station '" + pollingStation.name + "'" + " in " + pollingStation.commune + "</h1>");
}

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
	$("#dataVisualizationContainer").append("<div id='" + chartContainerDivId + "' style='width: 900px; height: 500px;'></div>");

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
	$("#dataVisualizationContainer").append("<div id='" + chartContainerDivId + "'></div>");

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
		['Bob',  translateIrregularity(irregularities.attemptToVoteMoreThanOnce)]
    ]);

	var options = {
	  	width: '450px'
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

function drawHowManyVotedByBarChart(){
	//TODO: Implement
}

function drawVotingProcessTable(){
	//TODO: Implement
}

function drawMissingMaterialTable(){
	//TODO: Implement
}
 
// Initialize polling station name dropdown list
function initPollingStationDropdown(communeName){

	// First clear the polling station drowpown list
	$('#polling_station_select option').remove();

	$.each(pollingStationGroupedByCommuneJson[communeName], function(index, value) {
		$('#polling_station_select')
			.append($("<option></option>")
			.attr("value", value)
			.text(value)); 
	});

	// init data visualization with default data selected
	var communeName = $('#commune_select').find(":selected").text();
	var pollingStationName = $('#polling_station_select').find(":selected").text();
		
	visualizeData(communeName, pollingStationName);
}

// Visualize all data that we want to visualize
function visualizeData(communeName, pollingStationName){
	
	clearPreviouslyGeneratedDataVisualization();

	var url = '/api/observations/' + communeName + '/' + pollingStationName

	$.get(url, function(data) {

		drawPollingStationInfo(data[0].pollingStation);

		$.each(data, function(index, observation) {
			var roomNumer =  observation.pollingStation.roomNumber;
			drawSectionHeader(index, roomNumer);

			var kvvMembers = observation.preparation.votingMaterialsPlacedInAndOutVotingStation.kvvMembers
			drawKvvMembersPieChart(index, kvvMembers);

			var irregularities = observation.irregularities;
			drawIrregularitiesTable(index, irregularities);

			drawHowManyVotedByBarChart();
			drawVotingProcessTable();
			drawMissingMaterialTable(); 
		});
		
	});
}

function clearPreviouslyGeneratedDataVisualization(){
	$("#dataVisualizationContainer").empty();
}

$(document).ready(function(){

	// Initialize commune name dropdown list.
	// index is the name of the commune.
	// value is the name of the polling stations.
	$.each(pollingStationGroupedByCommuneJson, function(index, value) {
		$('#commune_select')
			.append($("<option></option>")
			.attr("value", index)
			.text(index)); 
	});

	// Initialize polling station name dropdown listin relation to default commune name.
	initPollingStationDropdown($('#commune_select').find(":selected").text());

	// When new communue is selected, re-initialize the polling station name dropdown list.
	$('#commune_select').change(function(){
		initPollingStationDropdown($(this).val())
	});

	// When new polling station is selected, open new window that presents data.
	$('#polling_station_select').change(function(){

		var communeName = $('#commune_select').find(":selected").text();
		var pollingStationName = $('#polling_station_select').find(":selected").text();
		
		visualizeData(communeName, pollingStationName);
	});
});
