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

			var dropdownHtmlContent = getDropdownHtmlContent(electionSelectionParams[i]);

			if(i == 0){
				$('.dropdown-toggle.election-observer').html(dropdownHtmlContent);

				// Enable election year dropdown.
				$('.dropdown.election-year').removeClass('disabled');
				$('.dropdown-toggle.election-year').removeClass('disabled');
			

			}else if(i == 1){
				$('.dropdown-toggle.election-year').html(dropdownHtmlContent);

				// Enable election type dropdown.
				$('.dropdown.election-type').removeClass('disabled');
				$('.dropdown-toggle.election-type').removeClass('disabled');

			}else if(i == 2){
				$('.dropdown-toggle.election-type').html(dropdownHtmlContent);

				// Enable election round dropdown.
				$('.dropdown.election-round').removeClass('disabled');
				$('.dropdown-toggle.election-round').removeClass('disabled');


			}else if(i == 3){
				$('.dropdown-toggle.election-round').html(dropdownHtmlContent);

				// Display commune and polling tation selection dropdown.
				$('.polling-station-selection-container').css('display', 'block');

				// Enable search.
				$('#search-button').removeClass('disabled');
				buildSearchUrl();
			}	
		}
	}
});
function buildSearchUrl(){
	// Building the search url

	// Get the path of the document
	path = window.location.pathname;

	// Add '/search' to the path
	search_path= "/search"+path;

	// create an array based on the path string
	url_array=search_path.split('/');

	// Build the URL
	search_url='/'+url_array[1]+'/'+url_array[2]+'/'+url_array[3]+'/'+url_array[4]+'/'+url_array[5];

	// Get href element by id 'search-href'
	var link = document.getElementById("search-href");

	// Add Href Value to the href link
	link.setAttribute("href",search_url);
}
function initDropdowns(){
	$('.dropdown.election-year').addClass('disabled');
	$('.dropdown-toggle.election-year').addClass('disabled');

	$('.dropdown.election-type').addClass('disabled');
	$('.dropdown-toggle.election-type').addClass('disabled');

	$('.dropdown.election-round').addClass('disabled');
	$('.dropdown-toggle.election-round').addClass('disabled');

	$('.polling-station-selection-container').css('display', 'none');
}


function getDropdownHtmlContent(urlParam){
	var val = '';

	// TODO: Hardcoded for now because we only have one data source (KDI).
	// Needs to be automated when we have more datasources.
	if(urlParam == 'kdi'){
		val = 'Kosova Democratic Institute';

	// TODO: Just detect via regex if it is a year value return the same value if it is.
	}else if(urlParam == '2013'){
		val = '2013';

	// TODO: Just detect via regex if it is a year value return the same value if it is.
	}else if(urlParam == '2014'){
		val = '2014';

	}else if(urlParam == 'local-elections'){
		val = 'Local Elections';

	}else if(urlParam == 'general-elections'){
		val = 'General Elections';

	}else if(urlParam == 'first-round'){
		val = 'First Round';

	}else if(urlParam == 'second-round'){
		val = 'Second Round';
	}

	return val + ' <span class="caret"></span>';
}
