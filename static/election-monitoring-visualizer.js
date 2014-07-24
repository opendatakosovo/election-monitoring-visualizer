google.load("visualization", "1", {packages:["corechart"]});	

// Draw the KVV members gender distribution pit chart
function drawKvvMembersPieChart(index, kvvMembersTotal, kvvMembersFemale){

	// create div container for the pie chart
	// e.g. <div id="kvvMembersPieChart" style="width: 900px; height: 500px;"></div>
	var chartContainerDivId = 'kvvMembersPieChart-' + index;
	$("#kvvMembersPieChartsContainer").append("<div id='" + chartContainerDivId + "' style='width: 900px; height: 500px;'></div>");

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

// Initialize polling station name dropdown list
function initPollingStationDropdown(communeName){

	// First clear the polling station drowpown list
	$('#polling_station_select option').remove();

	$.each(polling_station_grouped_by_commune_json[communeName], function(index, value) {
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

		$.each(data, function(index, observation) {
			var kvvMembersTotal = observation.preparation.votingMaterialsPlacedInAndOutVotingStation.kvvMembers.total;
			var kvvMembersFemale = observation.preparation.votingMaterialsPlacedInAndOutVotingStation.kvvMembers.female;

			drawKvvMembersPieChart(index, kvvMembersTotal, kvvMembersFemale);
		});
		
	});
}

function clearPreviouslyGeneratedDataVisualization(){
	$("#kvvMembersPieChartsContainer").empty();
}

$(document).ready(function(){

	// Initialize commune name dropdown list.
	// index is the name of the commune.
	// value is the name of the polling stations.
	$.each(polling_station_grouped_by_commune_json, function(index, value) {
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
