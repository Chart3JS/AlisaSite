/*
 * Creative Blog & Portfolio Theme
 * Copyright 2015 8Guild.com
 * Custom scripts for Creative Theme
 */

/* Disable default link behavior for dummy links that have href='#'
 *********************************************************************/
$('a[href=#], .update a').click(function(e) {
  e.preventDefault();
});

SC.initialize({
  client_id: '24e4f5a6a6eb2b39a34bb53c60270526'
});
var track_url = 'https://soundcloud.com/alisa-plotkin/je-suis-malade';
function embed (id) {
  SC.oEmbed(track_url,
    { color: "ff0066"
      , auto_play: true
      , maxwidth: 500
      , maxheight: 1000
      , show_comments: true } // options
    , document.getElementById("scWidget") // what element to attach player to
  );
}
//verge is a compact set of cross-browser viewport utilities packed into an opensource JavaScript module
jQuery.extend(verge);
var desktop = true,
  tablet = false,
  tabletPortrait = false;
mobile = false;

$(window).resize(function() {
  if ($.viewportW() >= 1024) {
    desktop = true;
    tablet = false;
    tabletPortrait = false;
    mobile = false;
  }
  if ($.viewportW() >= 900 && $.viewportW() <= 1023) {
    desktop = false;
    tablet = true;
    tabletPortrait = false;
    mobile = false;
  }
  if ($.viewportW() >= 768 && $.viewportW() <= 899) {
    desktop = false;
    tablet = false;
    tabletPortrait = true;
    mobile = false;
  } else {
    if ($.viewportW() <= 767) {
      desktop = false;
      tablet = false;
      tabletPortrait = false;
      mobile = true;
    }
  }

}).resize();
var keys = {37: 1, 38: 1, 39: 1, 40: 1};

function preventDefault(e) {
  e = e || window.event;
  if (e.preventDefault)
    e.preventDefault();
  e.returnValue = false;
}

function preventDefaultForScrollKeys(e) {
  if (keys[e.keyCode]) {
    preventDefault(e);
    return false;
  }
}

function disableScroll() {
  if (window.addEventListener) // older FF
    window.addEventListener('DOMMouseScroll', preventDefault, false);
  window.onwheel = preventDefault; // modern standard
  window.onmousewheel = document.onmousewheel = preventDefault; // older browsers, IE
  window.ontouchmove  = preventDefault; // mobile
  document.onkeydown  = preventDefaultForScrollKeys;
}

function enableScroll() {
  if (window.removeEventListener)
    window.removeEventListener('DOMMouseScroll', preventDefault, false);
  window.onmousewheel = document.onmousewheel = null;
  window.onwheel = null;
  window.ontouchmove = null;
  document.onkeydown = null;
}

var isBannerShown = true;
var mainHeader = $('.header-main');
var bannerControl = $('.control-banner');
var placeholder = $('div#banner-placeholder');

function _animateNotes(isAnimated) {
  var notesContainer = $('ul#dancing-notes');
  var notes = notesContainer.find('li');
  var counter = 0;
  if(!!isAnimated) {
    notesContainer.show();
    notes.each(function() {
      $(this).css('-webkit-animation','music 1s '+counter+'00ms  ease-in-out both infinite');
      counter++;
    });
  } else {
    notesContainer.hide();
    notes.each(function() {
      $(this).css('-webkit-animation','none');
    });
  }

}

function _animateBanner(showAnimation, completed) {
  completed = completed || function() {};
  var mainHeaderHeight = !!mobile?70:190;
  var animDuration = !!showAnimation ? 1200 : 0;
    mainHeader.animate({
      height: [ mainHeaderHeight, "swing" ],
      top: -380
    }, animDuration, function() {
      // Animation complete.
      completed();
      isBannerShown = false;
      placeholder.show();
      mainHeader.hide();
      bannerControl.unbind('click');
      bannerControl.animate({
        top: -223
      }, 800, function() {
        bannerControl.unbind('click');
        _animateNotes(true);
        bannerControl.click(function() {
          isBannerShown = true;
          _animateNotes(false);
          setTimeout(function() {

            var close_banner = $('.paralax__images a#close_banner');
            close_banner.css({top: -100});
            close_banner.removeClass('hidden');
            close_banner.animate({
              top: [ 4, "swing" ]
            }, 200);
          }, 360);

          setTimeout(function(){
            placeholder.hide();
            mainHeader.show();
          }, 360);
          mainHeader.animate({
            height: [ 800, "swing" ],
            top: 0
          }, 1400, function() {
            // Animation complete.

            bannerControl.unbind('click');
            bannerControl.animate({
              top: -323
            }, 800, function() {
              //_toggleBanner();
            });
          })
        });
      });
    });
}

function _toggleBanner() {

  if(!!isBannerShown && mainHeader && mainHeader.length !== 0) {
    setTimeout(function() {_animateBanner(true);}, 18000);
  }
}

function _bindVideos() {
  var videoPlayerWrapper = $('div#popup-video-player-wrapper');
  videoPlayerWrapper.height(screen.height);
  var fbVideoPlayer = videoPlayerWrapper.find('video#fb-popup-video-player');
  var ytVideoPlayer = videoPlayerWrapper.find('iframe#yt-popup-video-player');
  $('div#videos-swiper-wrapper').find('a.video-wrapper').each(function() {
    var videoEl = $(this);
    videoEl.on('click', function(ev) {
      ev.preventDefault();
      ev.stopPropagation();
      var videoSourceType = videoEl.attr('video-source-type');
      var videoSource = videoEl.attr('href');
      videoPlayerWrapper.addClass('hidden');
      switch (videoSourceType) {
        case 'fb':
          ytVideoPlayer.attr({src: ''}).addClass('hidden');
          fbVideoPlayer.attr({src: videoSource}).removeClass('hidden');
              break;
        case 'yt':
          fbVideoPlayer.attr({src: ''}).addClass('hidden');
          ytVideoPlayer.attr({src: videoSource}).removeClass('hidden');
              break;
        default:
          ytVideoPlayer.attr({src: ''}).addClass('hidden');
          fbVideoPlayer.attr({src: videoSource}).removeClass('hidden');
              break;
      }
      if(!!isBannerShown) {
        _animateBanner(false, function() {
          _showVideo(videoPlayerWrapper);
        });
      } else {
        _showVideo(videoPlayerWrapper);
      }
    });
  });
}

function _showVideo(videoPlayerWrapper) {
  videoPlayerWrapper.css({top: $(document).scrollTop()});
  videoPlayerWrapper.removeClass('hidden');
  disableScroll();
  videoPlayerWrapper.click(function(ev){
    $(this).addClass('hidden');
    $(this).children().each(function() {
      $(this).addClass('hidden').attr({src: ''});
    });
    $(this).unbind('click');
    enableScroll();
    ev.preventDefault();
  });
}

function _animateVideosSlider(wrapper) {
  wrapper.find('.swiper-slide').each(function() {
    var shownFoundAtPosition = -1;
    var imageWrappers = $(this).find('a img.video-thumbnail');
    imageWrappers.each(function(ind){
      var imageWrapper = $(this);
      if(!imageWrapper.hasClass('hidden')) {
        shownFoundAtPosition = ind;
      }
    });
    $(imageWrappers[shownFoundAtPosition]).addClass('hidden');
    var nextShownImageIndex = 0;
    if(shownFoundAtPosition < imageWrappers.length -1) {
      nextShownImageIndex = shownFoundAtPosition + 1;
    }
    $(imageWrappers[nextShownImageIndex]).removeClass('hidden');
  });

}

$(document).ready(function() {
  embed("dj-faze");
  //parallax effect
  $('#scene').parallax();
  $('.paralax__images a#close_banner').click(function(ev) {
    $(this).addClass('hidden');
    _animateBanner(true);
  });
  //_toggleBanner();
  _bindVideos();
  var wrapper = $('div#videos-swiper-wrapper');
  setInterval(function() {
    _animateVideosSlider(wrapper);
  }, 4000);
  //search active
  $('.search a').on('click', function(e) {
    e.preventDefault();
    if ($('.inp').hasClass('active')) {
      $('.inp').removeClass('active');
    } else {
      $('.inp').addClass('active');
    }
  });

  //scroll animation to block scills
  $('.animate').each(function() {
    var block = $(this);
    $(window).scroll(function() {
      var top = block.offset().top;
      top = top - $(window).height();
      var scroll_top = $(this).scrollTop();
      if ((scroll_top > top)) {
        if (!block.hasClass('animate-active')) {
          block.addClass('animate-active').trigger('appear');
        }

      } else {
        //block.removeClass('animate-active');
      }
      if ($('.bar__i.animate-active').length) {
        $('.bar').find('.bar__i ').each(function() {
          $(this).css({
            height: $(this).attr('data-item') + "%"
          });
        });
      }
      if ($('.facts__i li .count').length) {
        $('.facts__i li .count').on('appear', function() {
          $(this).find('p').each(function() {
            var count = parseInt($(this).attr('data-number'));
            var block = $(this);
            var timeout = null;
            var step = 1;
            timeout = setInterval(function() {
              if (step == 25) {
                block.text(count.toString());
                clearInterval(timeout);
              } else {
                block.text((Math.floor(count * step / 25)).toString());
                step++;
              }
            }, 60);
          });
        });
      }
    });
  });

  $('.facts__i li .count p').each(function() {
    $(this).attr('data-number', parseInt($(this).text()));
  });

  //menu icon
  $('.menu-icon').on('click', function() {
    if ($('body, html').hasClass('menu-open')) {
      $('body, html').removeClass('menu-open');
    } else {
      $('body, html').addClass('menu-open');
    }
  });

  $('.menu-main a').each(function() {
    $(this).click(function(ev) {
      var link = $(this);
      if(!!link.hasClass('link-line')) {
      // an active link
        _animateBanner(false, function() {
          $('body, html').removeClass('menu-open');
        });

      }
      //ev.preventDefault();
      //ev.stopPropagation();
    });
  });
  //menu tablet & mobile
  if (!desktop) {
    $('.menu-main .drop').on('click', function(e) {
      //e.preventDefault();
      //var $this = $(this).closest('li').find('ul');
      //if ($this.hasClass('active')) {
      //  $this.removeClass('active');
      //} else {
      //  $this.addClass('active');
      //}

    });
  }

  // User quotes carousel
  $('.time-line_i .swiper-container').each(function() {
    $(this).swiper({
      slidesPerView: 'auto',
      nextButton: '.swiper-button-next-line',
      prevButton: '.swiper-button-prev-line',
      spaceBetween: 0
    });
  });

  // User quotes carousel
  $('.skill-slider .swiper-container').each(function() {
    $(this).swiper({
      loop: true,
      slidesPerView: '3',
      paginationClickable: true,
      nextButton: '.swiper-button-next-s',
      prevButton: '.swiper-button-prev-s'
    })
  });

  // User quotes carousel
  $(' .testi-slider .swiper-container').each(function() {
    $(this).swiper({
      loop: true,
      slidesPerView: '1',
      paginationClickable: true,
      nextButton: '.swiper-button-next',
      prevButton: '.swiper-button-prev'
    })
  });

  // User quotes carousel
  $('.latest-tweets__slide .swiper-container').each(function() {
    $(this).swiper({
      slidesPerView: '1',
      pagination: '.swiper-pagination',
      paginationClickable: true,
      loop: true
    })
  });

  // User quotes carousel
  $('.slider-horezontal .swiper-container').each(function() {
    $(this).swiper({
      slidesPerView: '1',
      paginationClickable: true,
      loop: true,
      nextButton: '.slider__swiper-button-next',
      prevButton: '.slider__swiper-button-prev',
      onSlideChangeEnd: function(swiper) {
        var container = swiper.container;
        var slides = swiper.slides;
        var slidesCount = swiper.slides.not('.' + swiper.params.slideDuplicateClass).length;
        var slide = slides.eq(swiper.activeIndex);
        var index = parseInt(slide.attr('data-swiper-slide-index'), 10);
        var directions = {
          prev: index - 1,
          next: index + 1
        };
        if (directions.prev < 0) {
          directions.prev = slidesCount - 1;
        }
        if (directions.next >= slidesCount) {
          directions.next = 0;
        }
        $.each([
          'prev',
          'next'
        ], function(i, type) {
          swiper.container.find(swiper.params[type + 'Button']).find('.img > img').attr('src', slides.filter('[data-swiper-slide-index="' + directions[type] + '"]').eq(0).find('img').data('img'));
        });
      }
    });

  });

  // User quotes carousel
  $('.slider-vertical .swiper-container').each(function() {
    $(this).swiper({

      loop: true,
      slidesPerView: 1,
      nextButton: '.slider__swiper-button-next',
      prevButton: '.slider__swiper-button-prev',
      direction: 'vertical',
      onSlideChangeEnd: function(swiper) {
        var container = swiper.container;
        var slides = swiper.slides;
        var slidesCount = swiper.slides.not('.' + swiper.params.slideDuplicateClass).length;
        var slide = slides.eq(swiper.activeIndex);
        var index = parseInt(slide.attr('data-swiper-slide-index'), 10);
        var directions = {
          prev: index - 1,
          next: index + 1
        };
        if (directions.prev < 0) {
          directions.prev = slidesCount - 1;
        }
        if (directions.next >= slidesCount) {
          directions.next = 0;
        }
        $.each([
          'prev',
          'next'
        ], function(i, type) {
          swiper.container.find(swiper.params[type + 'Button']).find('.img > img').attr('src', slides.filter('[data-swiper-slide-index="' + directions[type] + '"]').eq(0).find('img').data('img'));
        });
      }
    })
  });

  // click on our team block(mobile)
  if (mobile) {
    $('.our-team__i .item').on('click', function() {
      $(this).toggleClass('active');
    });
  }

  // User quotes carousel
  $('.magazines__slide .swiper-container').each(function() {
    $(this).swiper({
      slidesPerView: '1',
      paginationClickable: true,
      loop: true,
      nextButton: '.swiper-button-next',
      prevButton: '.swiper-button-prev'
    })
  });

  // User quotes carousel
  $('.swiper-slide-prev').each(function() {
    var el = $(this);
    if (el.closest('.swiper-container-horizontal').find('.slider__swiper-button-next').length) {

      $('.slider__swiper-button-next img').attr('src', el.attr('data-img'));

    }
  });

  // Scroll to top button
  $('.anchor-top').on('click', function() {
    var body = $(" body");
    body.animate({
      scrollTop: 0
    }, '500', 'swing');
  });

  // User quotes carousel
  $('.beauty-photoshot__slide .swiper-container').each(function() {
    $(this).swiper({
      loop: true,
      pagination: '.swiper-pagination2',
      paginationClickable: true,
      spaceBetween: 30
    })
  });
});


$(document).on('shown.bs.tab', 'a[data-toggle="tab"]', function(e) {
  // User quotes carousel
  $('.skill-slider .swiper-container').each(function() {
    $(this).swiper({
      loop: true,
      slidesPerView: '3',
      nextButton: '.swiper-button-next-s',
      prevButton: '.swiper-button-prev-s'
    })
  });
  // User quotes carousel
  $('.testi-slider .swiper-container').each(function() {
    $(this).swiper({

      loop: true,
      slidesPerView: '1',
      nextButton: '.swiper-button-next',
      prevButton: '.swiper-button-prev'

    })
  });
});

$(window).scroll(function() {
  var scroll = $(window).scrollTop();
  if (scroll >= 500) {
    $(".anchor-top").addClass("darkHeader");
  } else {
    $(".anchor-top").removeClass("darkHeader");
  }
});

//isotope
$(window).load(function() {
  $(window).resize(function() {
    if (!mobile) {
      var columns = $(".w33, .w66");
      columns.css("height", "auto");
      setEqualHeight(columns);
    }

    var $container = $('.project-list__i').isotope({
      itemSelector: '.item',
      masonry: {
        columnWidth: '.grid-sizer',
        gutter: '.gutter-sizer'
      }
    });

    $('#filters').on('click', 'li', function(e) {
      e.preventDefault();
      var filterValue = $(this).attr('data-filter');

      filterValue = filterFns[filterValue] || filterValue;
      $container.isotope({
        filter: filterValue
      });
    });

    $('.button-group').each(function(i, buttonGroup) {
      var $buttonGroup = $(buttonGroup);
      $buttonGroup.on('click', 'li', function() {
        $buttonGroup.find('.active').removeClass('active');
        $(this).addClass('active');
      });
    });
  }).resize();
  var filterFns = {};
});

//Custom radio & checkboxes
function setEqualHeight(columns) {
  var tallestcolumn = 0;
  columns.each(
    function() {
      var currentHeight = $(this).height();
      if (currentHeight > tallestcolumn) {
        tallestcolumn = currentHeight;
      }
    }
  );
  columns.height(tallestcolumn);
}
