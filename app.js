var express = require('express');
var minify = require('express-minify');
var compression = require('compression');
var jsUglify = require('uglify-js');
var cssmin = require('cssmin');
var i18n = require("i18n");
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var _ = require('lodash');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var hbs = require('hbs');
var globalDataHandler = require('./server/globalDataHandler');
var routes = require('./server/routes');
var renderHelpers = require('./server/renderHelpers');
var app = express();

// view engine setup
var viewDir = 'views';
app.set('views', path.join(__dirname, viewDir));
app.set('view engine', 'hbs');
try {
  globalDataHandler.initData(function(globals, startupError) {
    if (!!_.isNull(startupError)) {
      app.globals = globals;
      setInterval(function() {
        try {
          globalDataHandler.initData(function(gl, err) {
            if (!!_.isNull(err)) {
              console.log('global object refreshed');
              app.globals = gl;
              console.log('Application is up');
            } else {
              console.log('FB is unreachable ');
            }
          });
        } catch(ee) {
          console.log('FB is unreachable ' + ee);
        }
      }, 3000000);
      app.use(logger('dev'));
      app.use(bodyParser.json());
      app.use(bodyParser.urlencoded({ extended: false }));
      app.use(cookieParser());
      app.use(require('less-middleware')(path.join(__dirname, '/public')));
      app.use(express.static(path.join(__dirname, '/public')));
      app.use(minify({
        uglifyJS: jsUglify,
        cssmin: cssmin
      }));
      app.use(compression());
      i18n.configure({
        locales:['en', 'ru'],
        directory: __dirname + '/locales',
        defaultLocale: 'en'
      });

      app.use(i18n.init);
      hbs.registerPartials(__dirname + '/' + viewDir + '/partials');
      renderHelpers.registerHelpers(hbs, app, i18n);
      app.use('/', routes.registerRoutes(app, i18n));
// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));


// catch 404 and forward to error handler
      app.use(function(req, res, next) {
        var err = new Error('Not Found');
        err.status = 404;
        next(err);
      });

// error handlers

// development error handler
// will print stacktrace
      if (app.get('env') === 'development') {
        app.use(function(err, req, res, next) {
          res.status(err.status || 500);
          res.render('error', {
            message: err.message,
            error: err
          });
        });
      }

// production error handler
// no stacktraces leaked to user
      app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
          message: err.message,
          error: {}
        });
      });

    } else {
      console.log('FB is unreachable ' + startupError);
    }
  });
} catch (e) {

}




module.exports = app;
