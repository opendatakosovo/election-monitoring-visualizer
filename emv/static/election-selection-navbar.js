$(document).ready(function() {
	//TODO: When we cover observation data from different organization, we will
	//have to dynamically register nav bar menu item events instead of hardcoding like this.
	
	// First disable year, election type, and election round drop downs
	initDropdowns();
	
	// Build array of election selection parameters.
	// e.g. of resulting array: ["kdi", "2013", "local-elections", "first-round"]
	// Remove first '/', this is why we use substring.
	var pathname = window.location.pathname.replace(basePath, '').substring(1);

	if(pathname.length > 0){
		var electionSelectionParams = pathname.split('/');

		// Use the created array to determine the values to display on the dropdown lists
		for(var i=0; i < electionSelectionParams.length; i++){

			if(i >= 0){
				// Enter this block when an election monitoring organisation is selected.

				setDropdownProperties(electionSelectionParams[0]);
				
				// Enable election year dropdown.
				$('.dropdown.election-year').removeClass('disabled');
				$('.dropdown-toggle.election-year').removeClass('disabled');
			}

			if(i >= 1){
				// Enter this block when an election year is selected.

				setDropdownProperties(electionSelectionParams[1]);

				// Enable election type dropdown.
				$('.dropdown.election-type').removeClass('disabled');
				$('.dropdown-toggle.election-type').removeClass('disabled');
			}

			if(i >= 2){
				// Enter this block when an election type is selected.

				setDropdownProperties(electionSelectionParams[2]);

				// Enable election round dropdown.
				$('.dropdown.election-round').removeClass('disabled');
				$('.dropdown-toggle.election-round').removeClass('disabled');
			}

			if(i >= 3){
				// Enter this block when an election round is selected.

				setDropdownProperties(electionSelectionParams[3]);

				// Display commune and polling tation selection dropdown.
				$('.polling-station-selection-container').css('display', 'block');

				// Init and enable search link.
				initSearchPageLink();
			}	
		}
	}
});

function initSearchPageLink(){
	// Build the search page url.
	search_page_url = basePath + window.location.pathname.replace(basePath, '');

	// If doesn't end with '/search' already (like in the search page).
	if(search_page_url.indexOf("/search", search_page_url.length - "/search".length) == -1){
		search_page_url = search_page_url + "/search";
	}

	// Add url to the link anchor tag.
	$("#search-href").attr("href", search_page_url);

	// Enable link.
	$('#search-button').removeClass('disabled');
	$("#search-href").css("color", '#777');
}

function initDropdowns(){
	$('.dropdown.election-year').addClass('disabled');
	$('.dropdown-toggle.election-year').addClass('disabled');

	$('.dropdown.election-type').addClass('disabled');
	$('.dropdown-toggle.election-type').addClass('disabled');

	$('.dropdown.election-round').addClass('disabled');
	$('.dropdown-toggle.election-round').addClass('disabled');

	$('#search-button').addClass('disabled');

	$('.polling-station-selection-container').css('display', 'none');
}


function setDropdownProperties(urlParam){

	// TODO: Hardcoded for now because we only have one data source (KDI).
	// Needs to be automated when we have more datasources.
	if(urlParam == 'dia'){
		val = carretify('Democracy in Action');
		$('.dropdown-toggle.election-observer').html(val);
		$('.dropdown-link.election-observer#dia').addClass('selected');

		setNextDropdownLinkHrefs('election-year', 'election-observer');

	// TODO: Just detect via regex if it is a year value return the same value if it is.
	}else if(urlParam == '2013'){
		val = carretify('2013');
		$('.dropdown-toggle.election-year').html(val);
		$('.dropdown-link.election-year#2013').addClass('selected');

		setNextDropdownLinkHrefs('election-type', 'election-year');

		// If we selected 2013, we can just skip right ahead to selecting local elections for the next dropdown.
		// This is because there were only local elections in 2013.
		// TODO: Implement this navbar construction logic on load time with all the required look up and processing
		// done in the back-end.

		// First, remove the option for general elections. There was no general election in 2013.
		$('.dropdown-item.election-type.general-elections').css('display','none');

		// Now we load the desired page if we haven't already.
		var localElectionsHref = $('.dropdown-link.election-year#2013').attr('href') + '/local-elections';

		if(window.location.href.indexOf(localElectionsHref) == -1){
			window.location.href = localElectionsHref;
		}
		

	// TODO: Just detect via regex if it is a year value return the same value if it is.
	}else if(urlParam == '2014'){
		val = carretify('2014');
		$('.dropdown-toggle.election-year').html(val);
		$('.dropdown-link.election-year#2014').addClass('selected');

		setNextDropdownLinkHrefs('election-type', 'election-year');

		// If we selected 2014, we can just skip right ahead to selecting general elections first round for the next dropdown.
		// This is because there were only general elections in 2014 and there was only one round.
		// TODO: Implement this navbar construction logic on load time with all the required look up and processing
		// done in the back-end.

		// First, remove the option for local elections. There was no local election in 2014.
		$('.dropdown-item.election-type.local-elections').css('display','none');

		// Then, remove the option for second round. There was no second round in 2014.
		$('.dropdown-item.election-round.second-round').css('display','none');

		// Now we load new desired page if we haven't already
		var generalElectionsFirstRoundHref = $('.dropdown-link.election-year#2014').attr('href') + '/general-elections/first-round';

		if(window.location.href.indexOf(generalElectionsFirstRoundHref) == -1){
			window.location.href = generalElectionsFirstRoundHref;
		}
		
	}else if(urlParam == 'local-elections'){
		val = carretify('Local Elections');
		$('.dropdown-toggle.election-type').html(val);
		$('.dropdown-link.election-type#local-elections').addClass('selected');

		setNextDropdownLinkHrefs('election-round', 'election-type');

	}else if(urlParam == 'general-elections'){
		val = carretify('General Elections');
		$('.dropdown-toggle.election-type').html(val);
		$('.dropdown-link.election-type#general-elections').addClass('selected');

		setNextDropdownLinkHrefs('election-round', 'election-type');

	}else if(urlParam == 'first-round'){
		val = carretify('First Round');
		$('.dropdown-toggle.election-round').html(val);
		$('.dropdown-link.election-round#first-round').addClass('selected');

	}else if(urlParam == 'second-round'){
		val = carretify('Second Round');
		$('.dropdown-toggle.election-round').html(val);
		$('.dropdown-link.election-round#second-round').addClass('selected');
	}
}

function carretify(val){
	return val + ' <span class="caret"></span>';
} 

/**
Set href value of election dropdown links for a specific drop down link group.
e.g. for the year dropdowns href values, set them to these when the Democracy in Action organization is selected:
		http://opendatakosovo.org/app/election-monitoring-visualiser/dia/2013
		http://opendatakosovo.org/app/election-monitoring-visualiser/dia/2014

e.g. for the election type dropdowns href values, set them to these when 2013 is selected:
		http://opendatakosovo.org/app/election-monitoring-visualiser/dia/2013/local-elections
		http://opendatakosovo.org/app/election-monitoring-visualiser/dia/2013/general-elections

Note that there was only local elections in 2013, no general elections were held.
Need to implement separate filering logic to take these exceptions into account.
**/
function setNextDropdownLinkHrefs(dropdownLinkClassName, parentDropdownLinkClassName){
	$('.dropdown-link.' + dropdownLinkClassName).each(function(){

		var baseHref = $('.dropdown-link.' + parentDropdownLinkClassName + '.selected').attr('href');
		var year = $(this).attr('id');
		var href =  baseHref + '/' + year;

		$(this).attr('href', href);

	});
}
