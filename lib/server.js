// Dependencies - Express
var express = require('express');
var morgan = require('morgan');
var winston = require('winston');
var chalk = require('chalk');
var bodyParser = require('body-parser');
var errorhandler = require('errorhandler');
// Dependencies - Other
var _ = require('lodash');
var objectPath = require('object-path');

// Constants
var DEFAULT_CONFIG = require(process.cwd() + '/config');

/**
 * Creates an express server for the slacker app
 * @class Server
 * @constructor
 * @param {Object} options
 */
function Server(options) {

  // Load config, and merge with options passed in
  this.config = _.merge({}, DEFAULT_CONFIG, options);
  // Config getter
  this.config.get = objectPath.get;
  // Config setter
  this.config.set = objectPath.set;

  // Create the express app
  this.app = express();

  // Configure settings for the express app
  this.configureAppSettings();

}

/**
 * Configures the settings for the express app
 * @method configureAppSettings
 * @public
 */
Server.prototype.configureAppSettings = function configureAppSettings() {

  var self = this;
  var app = self.app;

  // Set the app name
  app.set('name', 'Slacker');

  // All environments
  app.set('port', process.env.PORT || 3000);
  app.use(morgan('dev'));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));

  // Development only
  if (app.get('env') === 'development') {
    app.use(errorhandler());
  }

};

/**
 * Starts the express app
 * @method start
 * @public
 */
Server.prototype.start = function start() {

  var self = this;
  var app = self.app;
  var port = app.get('port');
  var name = app.get('name');

  // Set the app up to listen on the defined port
  app.listen(port, function() {
    winston.info(chalk.bold.green('%s listening on port %d'), name, port);
  });

};

// Export the Server class
module.exports = Server;
