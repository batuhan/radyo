var seekBarInterval = null;
var currentIndex = 0;
var videos = [];

var DEFAULT_VIDEO_ID = '';
var URL_PREFIX = 'http://gdata.youtube.com/feeds/api/videos?q=';
var MAX_RESULTS = 1;
var QUERY_PARAMS = 'v=2&format=5&alt=json&fields=entry(title,media:group(media:thumbnail' +
  '[@yt:name="default"](@url),yt:videoid))&max-results=' + MAX_RESULTS;

$(document).ready(function() {
  
  $('#playerDiv').hide();
  $('#play').hide();
  $('#pause').hide();
  
  disable('previous', 'pause', 'play', 'next', 'volume', 'seek');
  
  var tag = document.createElement('script');
  tag.src = 'http://www.youtube.com/player_api';
  var firstScriptTag = document.getElementsByTagName('script')[0];
  firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
});

function getFeed(player, songName, startIndex) {
  currentIndex = 0;
  
  $.ajax({
    dataType: 'jsonp',
    url: URL_PREFIX + songName + '&' + QUERY_PARAMS + '&start-index=' + startIndex,
    success: function(response) {
      if (response.feed && response.feed.entry) {
        $.each(response.feed.entry, function(index, entry) {
          videos.push({
            'title': entry['title']['$t'],
            'thumbnail': entry['media$group']['media$thumbnail'][0]['url'],
            'videoid': entry['media$group']['yt$videoid']['$t'],
          });
        });
        
          playCurrentVideo(player);
        
      } else {
        playCurrentVideo(player);
      }
    }
  });
}

function onYouTubePlayerAPIReady() {
  player = new YT.Player('player', {
    height: '390',
    width: '640',
    videoId: DEFAULT_VIDEO_ID,
    playerVars: {
      'controls': 0,
      'enablejsapi': 1,
      'html5': 1,
      'origin': window.location.host
    },
    events: {
      'onStateChange': onStateChange,
      'onPlaybackQualityChange': onPlaybackQualityChange,
      'onError': onError
    }
  });
  
  $('#pause').click(function() {
    if ($(this).attr('disabled') == 'false') {
      player.pauseVideo();
      $('#pause').hide();
      $('#play').show();
    }
  });
  
  $('#play').click(function() {
    if ($(this).attr('disabled') == 'false') {
      player.playVideo();
      $('#play').hide();
      $('#pause').show();
    }
  });
  
  $('#volume').change(function() {
    player.setVolume($(this).val());
  });
  
  $('#seek').change(function() {
    if (seekBarInterval != null) {
      clearInterval(seekBarInterval);
    }
    
    $('#currentTime').html(secondsToMmSs($(this).val()));
  });
  
  $('#seek').mouseup(function() {
    player.seekTo($(this).val(), true);
    
    setSeekBarInterval();
  });
  
}

function playCurrentVideo(player) {
  if (seekBarInterval != null) {
    clearInterval(seekBarInterval);
  }
  
  $('#currentTime').html(secondsToMmSs(0));
  $('#duration').html(secondsToMmSs(0));
  
  if (videos.length > 0) {
    $('#playerDiv').show();
  
    var currentVideo = videos[currentIndex];
  
    if (currentVideo != null) {
      $('#title').html(currentVideo.title);
      player.loadVideoById(currentVideo.videoid);
      
      $('#play').hide();
      $('#pause').show();

    }
  } else {
    $('#playerDiv').hide();
  }
}

function onStateChange(event) {
  console.log('State is ' + event.data);
  
  var player = event.target;

  switch (event.data) {
    case YT.PlayerState.ENDED:
      if (seekBarInterval != null) {
        clearInterval(seekBarInterval);
        seekBarInterval = null;
      }
      
      var duration = Math.round(player.getDuration());
      $('#currentTime').html(secondsToMmSs(duration));
      $('#seek').val(duration);

      enable('play');
      disable('pause', 'volume', 'seek');
      
      playNext();
    break;
      
    case YT.PlayerState.PLAYING:
      if (seekBarInterval != null) {
        clearInterval(seekBarInterval);
      }
      
      setSeekBarInterval();
      
      enable('pause', 'volume', 'seek');
      disable('play');
      
      $('#volume').val(player.getVolume());
      
      var duration = Math.round(player.getDuration());
      $('#duration').html(secondsToMmSs(duration));
      $('#seek').attr('max', duration);
    break;
      
    case YT.PlayerState.PAUSED:
      enable('play', 'volume', 'seek');
      disable('pause');
      
      if (seekBarInterval != null) {
        clearInterval(seekBarInterval);
        seekBarInterval = null;
      }
    break;
      
    case YT.PlayerState.BUFFERING:
      enable('pause', 'volume', 'seek');
      disable('play');
      
      if (seekBarInterval != null) {
        clearInterval(seekBarInterval);
        seekBarInterval = null;
      }
    break;
      
    case YT.PlayerState.CUED:
      enable('play');
      disable('pause', 'volume', 'seek');
    break;
  }
}

function enable() {
  $.each(arguments, function(i, id) {
    $('#' + id).attr('disabled', false);
  });
}

function disable() {
  $.each(arguments, function(i, id) {
    $('#' + id).attr('disabled', true);
  });
}

function secondsToMmSs(seconds) {
  var minutesValue = Math.floor(seconds / 60);
  var secondsValue = Math.floor(seconds % 60);
  if (secondsValue < 10) {
    secondsValue = '0' + secondsValue;
  }
  
  return minutesValue + ':' + secondsValue;
}

function setSeekBarInterval() {
  seekBarInterval = setInterval(function() {
    var currentTime = Math.round(player.getCurrentTime());
    $('#currentTime').html(secondsToMmSs(currentTime));
    $('#seek').val(currentTime);
  }, 1000);
}

function onPlaybackQualityChange(event) {
}

function onError(event) {
  console.log(event);
}
