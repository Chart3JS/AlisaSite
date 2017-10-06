var fs = require('fs'),
  _ = require('lodash'),
  moment = require('moment'),
  https = require('https');
var LOCALES_PATH = 'locales';
const FB_EVENTS_API_URL = 'https://graph.facebook.com/v2.5/#page_id#/events?access_token=#access_token#&debug=all&format=json&method=get&pretty=0&suppress_http_code=1&fields=cover,name,description,place,start_time';
const FB_VIDEOS_API_URL = 'https://graph.facebook.com/v2.5/#page_id#/videos?access_token=#access_token#&debug=all&fields=event,content_category,place,permalink_url,id,description,backdated_time_granularity,source,likes,thumbnails,updated_time&format=json&method=get&pretty=0&suppress_http_code=1';
const FB_FEEDS_API_URL = 'https://graph.facebook.com/v2.5/#page_id#/feed?access_token=#access_token#&debug=all&fields=application,call_to_action,child_attachments,coordinates,created_time,description,link,feed_targeting&include_hidden=true';
const FB_PAGE_ALBUMS_API_URL = 'https://graph.facebook.com/v2.6/#page_id#?access_token=#access_token#&debug=all&fields=albums%7Bcount%2Clink%2Clocation%2Cname%2Cid%7D&format=json&method=get&pretty=0&suppress_http_code=1';
const FB_ALBUM_PHOTOS_API_URL = 'https://graph.facebook.com/v2.6/#album_id#?access_token=#access_token#&debug=all&fields=photos%7Bheight%2Cfrom%2Cid%2Cimages%2Cwidth%2Clink%7D&format=json&method=get&pretty=0&suppress_http_code=1';
const YOUTUBE_VIDEO_LINK_TEMPLATE = 'https://www.youtube.com/embed/';
module.exports = {
  initData: function(calback) {
    var pages = require('../config/pages');
    var config = require('../config/config.json');
    var dictionaries = fs.readdirSync(LOCALES_PATH);
    var sysDictionary = {};
    _.each(dictionaries, function(dict) {
      var langName = dict.replace('.json', '');
      var dictContent = _.invert(require('../' + LOCALES_PATH + '/' + dict));
      sysDictionary[langName] = dictContent
    });
    var fbPageEvents = FB_EVENTS_API_URL.replace("#access_token#", config.facebook.access_token).
      replace("#page_id#", config.facebook.page_id);
    _retrieveData(fbPageEvents, {}, function(eventsResponse) {
      var nowTime = (new Date()).getTime();
      // sort events in ascending order by start time
      var events = eventsResponse.data.sort(function(ev1, ev2) {
        return (new Date(ev1.start_time)) - (new Date(ev2.start_time));
      });
      _.each(events, function(event){
        event.startTime = moment(event.start_time);
        event.start_time = event.startTime.format('dddd, MMMM Do YYYY, HH:mm');
        if(!_.isUndefined(event.end_time)) {
          event.endTime = moment(event.end_time);
          event.end_time = event.endTime.format('dddd, MMMM Do YYYY, HH:mm');
        } else {
          event.endTime = event.startTime;
          event.end_time = event.start_time;
        }
        if(!!_.isUndefined(event.place)) {

        }
      });

      var fbPageVideos = FB_VIDEOS_API_URL.replace("#access_token#", config.facebook.access_token).
      replace("#page_id#", config.facebook.page_id);
      _retrieveData(fbPageVideos, {}, function(videosResponse) {
        var videos = videosResponse.data.sort(function(v1, v2) {
          return (new Date(v2.updated_time)) - (new Date(v1.updated_time));
        });
        var videosMapping = require('../config/video_fb_yt_mapping.json');
        _.each(videos, function(video) {
          var youtubeVideoId = videosMapping[video.id];
          video.fb_source = video.source;
          if(!_.isUndefined(youtubeVideoId)) {
            video.source = YOUTUBE_VIDEO_LINK_TEMPLATE + youtubeVideoId;
            video.videoSourceType = 'yt';
          } else {
            video.videoSourceType = 'fb';
          }
        });
        var feedsURL = FB_FEEDS_API_URL.replace("#access_token#", config.facebook.access_token).
        replace("#page_id#", config.facebook.page_id);
        _retrieveData(feedsURL, {}, function(feeds) {
          var soundCloudTraks = [];
          _.each(feeds.data, function(feed) {
            if(!_.isUndefined(feed.application && feed.application.name === 'SoundCloud')) {
              soundCloudTraks.push({
                trackURL: feed.link.substring(0, feed.link.indexOf('?'))
              });
            }
          });
          var albumsURL = FB_PAGE_ALBUMS_API_URL.replace("#access_token#", config.facebook.access_token).
          replace("#page_id#", config.facebook.page_id);
          _retrieveData(albumsURL, {}, function(albumsData) {
            var albums = albumsData.albums.data;
            var photos = [];
            var albumsCount = albums.length;
            var albumsCounter = 0;
            for(var albumIndex = 0; albumIndex < albumsCount; albumIndex++) {
              var album = albums[albumIndex];
              var albumUrl = FB_ALBUM_PHOTOS_API_URL.replace("#access_token#", config.facebook.access_token).
              replace("#album_id#", album.id);
              _retrieveData(albumUrl, {}, function(photosData) {
                if(!_.isEmpty(photosData.photos)) {
                  var albumPhotos = photosData.photos.data;
                  photos = _.concat(photos, albumPhotos);
                  albumsCounter++;
                  if(albumsCount === albumsCounter) {
                    console.log("############## THE SERVER IS UP #############");
                    calback({
                      config: config,
                      pages: pages,
                      sysDictionary: sysDictionary,
                      photos: photos,
                      events: events,
                      videos: videos,
                      audio: soundCloudTraks
                    }, null);
                  }
                } else {
                  albumsCounter++;
                }
              }, function(err) {
                calback (null, err);
              });
            }
          }, function(err) {
            calback (null, err);
          });
        }, function(err) {
          calback (null, err);
        });
      }, function(err) {
        calback (null, err);
      });
  }, function(err) {
      calback (null, err);
    });
  }
};

function _retrieveData(URL_TEMPLATE, options, success, fail) {
  options = options || {};
  var url = URL_TEMPLATE + (options.params || '');
  var parseBody = options.params ? options.params.parse : true;
  https.get(url, function(res) {
    var body = '';

  res.on('data', function(chunk) {
    body += chunk;
});

  res.on('end', function() {
    if(!!parseBody) {
    success(JSON.parse(body));
  } else {
    success(body);
  }

});
}).on('error', function(e) {
    //console.error("Got an error: ", e);
  fail(e);
});
}
