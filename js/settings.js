/* Author: Batuhan Icoz */
var lastFmApiKey = "6a040e6842f5c100c5a9816c4e28cdaf"; // enter your lastfm api key here

var maxSearchResults = 5;
var maxSuggestionResults = 3;
var videoLoadingDelayTolerance = 4;

var spinner_opts = {
  lines: 6, // The number of lines to draw
  length: 0, // The length of each line
  width: 4, // The line thickness
  radius: 4, // The radius of the inner circle
  color: '#000', // #rgb or #rrggbb
  speed: 1, // Rounds per second
  trail: 100, // Afterglow percentage
  shadow: false // Whether to render a shadow
};
var spinner_target = document.getElementById('suggestionLoading');
var spinner_target_2 = document.getElementById('searchLoading');