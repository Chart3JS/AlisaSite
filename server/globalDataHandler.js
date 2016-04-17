var fs = require('fs'),
  _ = require('lodash'),
  moment = require('moment'),
  https = require('https'),
  SoundCloudAPI = require('./sc_data_provider');
//var SoundCloudAPI = require("node-soundcloud");
var LOCALES_PATH = 'locales';
const FB_EVENTS_API_URL = 'https://graph.facebook.com/v2.5/#page_id#/events?access_token=#access_token#&debug=all&format=json&method=get&pretty=0&suppress_http_code=1&fields=cover,name,description,place,start_time';
const FB_VIDEOS_API_URL = 'https://graph.facebook.com/v2.5/#page_id#/videos?access_token=#access_token#&debug=all&fields=event,content_category,place,permalink_url,id,description,backdated_time_granularity,source,likes,thumbnails,updated_time&format=json&method=get&pretty=0&suppress_http_code=1';
const POSTS_API_ADDRESS = 'https://public-api.wordpress.com/rest/v1.1/sites/ilovesingblog.wordpress.com/';


/*var initOAuth = function(req, res) {
  var url = SC.getConnectUrl();

  res.writeHead(301, {Location: url});
  res.end();
};*/
module.exports = {
  initData: function(calback) {
    //var scClient = new SoundCloudAPI('24e4f5a6a6eb2b39a34bb53c60270526', '4ed02ac34cfd8f03aa9f091e0479cc21');
    //debugger;
    SoundCloudAPI.init();
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
      });

      var fbPageVideos = FB_VIDEOS_API_URL.replace("#access_token#", config.facebook.access_token).
      replace("#page_id#", config.facebook.page_id);
      _retrieveData(fbPageVideos, {}, function(videosResponse) {
        var videos = videosResponse.data.sort(function(v1, v2) {
          return (new Date(v2.updated_time)) - (new Date(v1.updated_time));
        });
        //_retrieveData(POSTS_API_ADDRESS + 'posts')
        calback({
          config: config,
          pages: pages,
          sysDictionary: sysDictionary,
          events: events,
          videos: videos
        });
      }, function(err) {
        //debugger;
      });
  }, function(err) {
      //debugger;
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
    console.error("Got an error: ", e);
  fail(e);
});
}
