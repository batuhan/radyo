var maxSearchResults = 5;
var maxSuggestionResults = 6;
var videoLoadingDelayTolerance = 4;

var searchResults, suggestionResults;
var playedSoFar = new Array();

var searchTimeout;

function playNext(){
	if (suggestionResults){
		nextTrack = suggestionResults.shift();
		if (nextTrack){
			startPlaying(nextTrack);
		}
	}
}

function showVideo(){
	$("#player").toggle();
	$('#btnShowVideo').toggle();
	$('#btnHideVideo').toggle();
}
function showVolume(){
	$('#volume_div').toggle();
}
 
function doSearch(q){
	$('#searchResults').html('');
	
	preSearchHook();

	url = 'http://ws.audioscrobbler.com/2.0/?method=track.search&track='+encodeURIComponent(q)+'&api_key='+ lastFmApiKey;

	$.get(url, function(xml){


		$('track', xml).each(function(i){
			var images = new Array();

			$(this).find("image").each(function(img){
				images.push($(this).text());
			});

			searchResults.push({
				name: $(this).find("name").text(),
				artist: $(this).find("artist").text(),
				images: images
			});
		});

		postSearchHook();
	});
}

function preSearchHook(){
	$('#what').hide();
	$('#noresults').hide();
	$('#loading').show();
	$('#searchResults').html('');
	searchResults = new Array();
	$('#searchResults').slideDown();
}

function postSearchHook(){
	$('#loading').hide();
	searchResults = searchResults.slice(0, maxSearchResults);

	if (searchResults.length == 0){
		$('#noresults').show();	
	} else {
		searchResults.map(function(result){
			main = $('<div />', {
				class: 'result',
				click: function() {
						startPlaying(result); 	
						$('#searchResults').slideUp();
						return false;
					}
			}).appendTo('#searchResults')

			anchor = $('<a />', {
				src: result.images[0], // small
				text: result.artist + ' - ' + result.name,
				href: '#'
			}).appendTo(main);

			$('<img />', {
				src: result.images[0], // small
				width: 30,
				height: 30,
				class: 'albumart'					
			}).prependTo(anchor);

		});

		$('#searchResults').slideDown();
	}
}

function suggestTracks(artist, title){
	url= 'http://ws.audioscrobbler.com/2.0/?method=track.getsimilar&artist='+ artist +'&track='+ title +'&autocorrect=1&api_key='+ lastFmApiKey

	preSuggestionHook();		

	$.get(url, function(xml){
		$('track', xml).each(function(i){

			var _images = new Array();

			$(this).find("image").each(function(img){
				_images.push($(this).text());
			});

			suggestionResults.push({
				name: $(this).find("name").first().text(),
				artist: $(this).find("artist").find("name").text(),
				images: _images
			});
		});

		postSuggestionHook();
	});
}

function preSuggestionHook(){
	$('#nosuggestions').hide;
	$('#suggestionResults').html('');
	suggestionResults = new Array();
	$('#loading').show();
}

function postSuggestionHook(){
	$('#loading').hide();
	$('#suggestions').slideDown();

	filteredResults = new Array();
	suggestionResults.map(function(track){
		if (playedSoFar.indexOf(track.name) == -1){
			filteredResults.push(track);
		}
	});

	suggestionResults = filteredResults;

	if(suggestionResults.length < 1) $('#btnNext').attr('disabled', 'disabled');
	else $('#btnNext').removeAttr('disabled');

	renderSuggestionResults(suggestionResults);
}

function renderSuggestionResults(results){
	results = results.slice(0, maxSuggestionResults);

	$('#suggestionResults').empty();

	if (results.length == 0){
		$('#nosuggestions').show();
	} else {
		results.map(function(result){
			
			var songname_with_artist = result.artist + ' by ' + result.name;
			
			main = $('<li />', {
				class: 'result'
			}).appendTo('#suggestionResults');
			
			meta = $('<a />', {
				class: 'meta',
				rel: 'twipsy',
				href: '#',
				click: function(){
					$('#suggestions').slideUp(
						function(){
							startPlaying(result);
							return false;
						});
				}
			}).attr('title', songname_with_artist).appendTo(main);

			$('<a />', {
				class: 'btn small',
				id: 'skip_suggestion',
				text: "Skip",
				click: function(){
					$(this).parent().remove();
					if (suggestionResults){
						var tmp = suggestionResults.shift();
						renderSuggestionResults(suggestionResults);
					}
				}
			}).appendTo('#suggestions_skip_link');
			
			$('<img />', {
				src: result.images[2], // big
				width: 175,
				height: 175,
				class: 'thumbnail'					
			}).prependTo(
				meta
			);

			$('#suggestions_skip_link').hide().first().show();
		});
	}
}

function startPlaying(result){
	if (result.images){
		_biggestImg = result.images.pop();
		if (_biggestImg) $('#albumCover').attr('src', _biggestImg); 
	}
	
	document.title = result.title + " - " + result.artist + " - Batuhan's Radyo";
	
	// show info and now playing info.
	$('#info').show();
	
	startPlayingFromYoutube(result.artist, result.name);
}

function startPlayingFromYoutube(artist, title){		
	
	playedSoFar.push(title);

   // show info and now playing info.

	suggestTracks(artist,title);
	
	//player
	currentIndex = 0;
    videos = [];
	
    getFeed(player, artist + ' ' + title, 1);
	$('#source').html('YouTube');

    return false;
}

// Read a page's GET URL variables and return them as an associative array. http://snipplr.com/users/Roshambo/
function getUrlVars()
{
    var vars = [], hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for(var i = 0; i < hashes.length; i++)
    {
        hash = hashes[i].split('=');
        vars.push(hash[0]);
        vars[hash[0]] = hash[1];
    }
    return vars;
}

var q_from_url = getUrlVars()["q"];

// on document ready
$(function(){
		
	$("#q").focus();
		
	$('#q').keyup(function(){
		$('#loading').show();
		if (searchTimeout) clearTimeout(searchTimeout);

		searchTimeout = setTimeout(function(){
			if ($('#q').val())
				doSearch($('#q').val());
			else 
				$('#loading').hide();
		}, 500);
	});

	$('#q').focus(function(){
		if ($(this).val()=='Type an artist or song name')
			$(this).val('');
	})

	$('#q').blur(function(){
		if (!$(this).val()) $(this).val('Type an artist or song name');
	})
	
	$("#q").val(q_from_url);
	
});