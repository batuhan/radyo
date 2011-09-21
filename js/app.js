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
	$('#player').toggle();
	
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
	$('#searchLoading').show();
	$('#searchResults').html('');
	searchResults = new Array();
	$('#searchResults').slideDown();
}

function postSearchHook(){
	$('#searchLoading').hide();
	searchResults = searchResults.slice(0, maxSearchResults);

	if (searchResults.length == 0){
		$('#searchResults').html('No results found. Try checking your spelling maybe?');
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
	$('#suggestionResults').html('');
	suggestionResults = new Array();
	$('#suggestionLoading').show();
}

function postSuggestionHook(){
	$('#suggestionLoading').hide();
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
		$('#suggestionResults').html('No suggestions to play next. Try searching for more known tracks.');
	} else {
		results.map(function(result){
			main = $('<div />', {
				class: 'result'
			}).appendTo('#suggestionResults');

			meta = $('<a />', {
				class: 'meta',
				href: '#',
				click: function(){
					$('#suggestions').slideUp(
						function(){
							startPlaying(result);
							return false;
						});
				}
			}).appendTo(main);

			$('<div />', {
				class: 'title',
				text: result.name
			}).appendTo(meta);

			$('<div />', {
				class: 'artist',
				text: result.artist
			}).appendTo(meta);

			$('<a />', {
				class: 'actions',
				text: "✖ Skip",
				click: function(){
					$(this).parent().remove();
					if (suggestionResults){
						var tmp = suggestionResults.shift();
						renderSuggestionResults(suggestionResults);
					}
				}
			}).appendTo(main);

			$('<img />', {
				src: result.images[1], // med
				width: 64,
				height: 64,
				class: 'albumart'					
			}).prependTo(
				meta
			);

			$('#suggestionResults .actions').hide().first().show();
		});
	}
}

function startPlaying(result){
	if (result.images){
		_biggestImg = result.images.pop();
		if (_biggestImg) $('#albumCover').attr('src', _biggestImg); 
	}
	
	startPlayingFromYoutube(result.artist, result.name, result.artist + ' ' + result.name);
}

function startPlayingFromYoutube(artist, title, songname){		
	
	playedSoFar.push(title);

    // show info and now playing info.

	$('#info').show();

	suggestTracks(artist,title);
	
	//player
	
	currentIndex = 0;
    videos = [];
	
    getFeed(player, songname, 1);

    return false;
}

// on document ready
$(function(){		
	$('#q').keyup(function(){
		$('#searchLoading').show();
		if (searchTimeout) clearTimeout(searchTimeout);

		searchTimeout = setTimeout(function(){
			if ($('#q').val())
				doSearch($('#q').val());
			else 
				$('#searchLoading').hide();
		}, 500);
	});

	$('#q').focus(function(){
		if ($(this).val()=='Type an artist or song name')
			$(this).val('');
	})

	$('#q').blur(function(){
		if (!$(this).val()) $(this).val('Type an artist or song name');
	})

});