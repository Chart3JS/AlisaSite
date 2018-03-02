var express = require('express'),
  router = express.Router(),
  _ = require('lodash');

function _getGlobal(req) {
  return req.app.globals;
}

function _getPage(req, res, next){
  var globals = _getGlobal(req);
  var pages = globals.pages;
  var sysDictionary =  globals.sysDictionary;
  var localeName = req.getLocale();
  var viewName = sysDictionary[localeName][req.params.pageName];
  var pageConfig = _.find(pages, function(p) {return p.name === viewName});
  res.render(viewName, { title: res.__(pageConfig.title), globals: globals });
}
module.exports = {
  registerRoutes: function(app, i18n) {
    router.get('/', function(req, res, next) {
      // the main page
      var globals = _getGlobal(req);
      res.render('index', { title: res.__('main_text_title'), globals: globals });
    });
    router.get('/tou', function(req, res, next) {
      // the main page
      var globals = _getGlobal(req);
      res.render('tou', { title: res.__('main_text_title'), globals: globals });
    });
    router.get('/privacy', function(req, res, next) {
      // the main page
      var globals = _getGlobal(req);
      res.render('privacy', { title: res.__('main_text_title'), globals: globals });
    });

    router.get('/articles/:pageName', function(req, res, next) {
      _getPage(req, res, next);
    });
    router.get('/:pageName', function(req, res, next) {
      _getPage(req, res, next);
    });
    return router;
  }
};
