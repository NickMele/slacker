var express = require('express');
var logger = require('morgan');
var bodyParser = require('body-parser');
var errorhandler = require('errorhandler');

var slacker = require('./lib/slacker');
var bots = require('./bots');

// create the express app
var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// development only
if ('development' == app.get('env')) {
  app.use(errorhandler());
}

// load up the slacker app
slacker.registerBots(bots);
slacker.registerRoute(app);

var server = app.listen(app.get('port'), function() {
  console.info('Slacking on port %d', server.address().port);
});
