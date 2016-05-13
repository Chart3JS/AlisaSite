/**
 * Created by alexanderplotkin on 03/03/2016.
 */
var i18n = require("i18n");
var fs = require('fs');
var _ = require('lodash');
var moment = require('moment');
var CONFIG_PATH = '../config/';
var MENU_CONFIG_FILE_PATH = CONFIG_PATH + 'menu.json';
var menu_config = null;
var trns;
module.exports = {
  registerHelpers: function(hbs, app, i18n){
    trns = i18n.__;
    var handlebars = hbs.handlebars;
    hbs.registerHelper('t', function(str) {
      return trns(str);
    });
    hbs.registerHelper('include', function(partialName, pageName) {
      var context = {};
      switch (partialName) {
        case 'menu':
          if(!!_.isNull(menu_config)) {
            context.menu_data = menu_config = require(MENU_CONFIG_FILE_PATH);
          }
          context.menu_data = menu_config;
          context.selected = pageName;
          break;
        case 'events':
            var events = app.globals.events;
            var eventsCount = events.length;
            var eventsString = '';
            var nowTime = moment();
            for(var eventIndex = 0; eventIndex < eventsCount; eventIndex++) {
              var event = events[eventIndex];
              event.nowActive = false;
              if(!!nowTime.isSameOrAfter(event.endTime)) {
                continue;
              } else if(nowTime.isSameOrAfter(event.startTime) && nowTime.isSameOrBefore(event.endTime)) {
                event.nowActive = true;
              }
              var eventPartial = handlebars.partials['event'];
              if (typeof eventPartial !== 'function') {
                eventPartial = handlebars.compile(eventPartial);
              }
              eventsString += eventPartial(event);
            }
            return eventsString;
          break;
        default:

              break;
      }

      var partial = handlebars.partials[partialName];
      if (typeof partial !== 'function') {
        partial = handlebars.compile(partial);
      }
      return partial(context); // build up the context some how
    });
    hbs.registerHelper('video_item', function() {
      var videos = app.globals.videos;
      var videosCount = videos.length;
      var videosHTML = '';
      var videoItemPartial = handlebars.partials['videoItem'];
      if (typeof videoItemPartial !== 'function') {
        videoItemPartial = handlebars.compile(videoItemPartial);
      }
      for(var videoIndex = 0; videoIndex < videosCount; videoIndex++) {
        var video = videos[videoIndex];
        var thumbnails = video.thumbnails.data;
        videosHTML += videoItemPartial(video);
      }
      return new hbs.SafeString(videosHTML);
    });

    hbs.registerHelper('image_gallery', function() {
      var galleryHTML = '';
      //var infoDiv = ' <div style="display: none;"><div id="htmlcaption3"><em>HTML</em> caption. Back to <a href="http://www.menucool.com/">Menucool</a>.</div><div id="htmlcaption5">Smart Lazy Loading Image</div></div>';
      var sliderHTML = '<div class="slider-inner"><ul>';
      var thumbnailsHTML = '<div id="thumbnail-slider"><div class="inner"><ul>';
      var photos = app.globals.photos;
      var photosCount = photos.length;
      for(var photoIndex = 0; photoIndex < photosCount; photoIndex++) {
        var photo = photos[photoIndex];
        var images = photo.images;
        var fullImage = images[images.length - 3];
        var thumbnail = images[images.length - 2];
        sliderHTML += '<li><a class="ns-img" href="' + fullImage.source + '"></a></li>';
        //if(photoIndex === 0) {
        //  sliderHTML += '<a target="_blank" href="' + fullImage.source + '" title="">' +
        //    '<img src="' + fullImage.source + '" alt="" />' +
        //    '</a>';
        //} else {
        //  sliderHTML += '<a class="lazyImage" href="' + fullImage.source + '" title=""></a>';
        //}
        thumbnailsHTML += '<li><a class="thumb" href="' + thumbnail.source + '"></a><span>' + photoIndex + '</span></li>';
      }
      sliderHTML += '</ul><div class="fs-icon" title="Expand/Close"></div></div>';
      thumbnailsHTML += '</ul></div></div>';
      galleryHTML = sliderHTML + thumbnailsHTML;
      return new hbs.SafeString(galleryHTML);
    });
    hbs.registerHelper('menu_item',_buildMenuItem);
    hbs.registerHelper('menu',function(menuItems, selectedItem) {
      var menu = '';
      _.each(menuItems, function(menuItem) {
        var nestedItems = menuItem.items;
        menu += _buildMenuItem(menuItem, null, selectedItem, _.isArray(nestedItems));
        if(!!_.isArray(nestedItems)) {
          menu += '<ul>';
          var currentMenuItem = menuItem;
          _.each(nestedItems, function(childMenuItem) {
            menu += _buildMenuItem(childMenuItem, currentMenuItem, selectedItem, false);
          });
          menu += '</ul></li>';
        }
      });
      return new hbs.SafeString(menu);
    });
    hbs.registerHelper('single_video_item', function(width, height, index) {
      if(!!_.isUndefined(index)) {
        index = 0;
      }
      var videoItem = app.globals.videos[index];
      //var videoHTML = "<video width='" + width + "' height='" + height + "' controls name='media'><source src='" + videoItem.source +
      var videoHTML = "<video class='fb-video-player' controls name='media'><source src='" + videoItem.source +
        "' type='video/mp4'/></video>";
      return new hbs.SafeString(videoHTML);
    });

    function _buildMenuItem(menuItem, parent, selectedItem, hasChildren) {
      var selected = menuItem.name === selectedItem;
      var className = '';
        // write a link
        if(!!_.isNull(parent)) {
          // a first level item
          className = 'drop link-line';
        } else {
          className = 'link-line';
        }
        return new hbs.SafeString( '<li><a href="' + _buildURL(menuItem.link) + '" class="' + className + '">' + trns(menuItem.title_key) + '</a>'  + (!hasChildren?'</li>':'') );
    }
    function _buildURL(link) {
      return (link.prefix ? (link.prefix + '/') : '/') + trns(link.href);
    }
  }
};
