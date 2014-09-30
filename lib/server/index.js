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
var DEFAULT_CONFIG = require('./config');

/**
 * Creates an express server for the slacker app
 * @class Server
 * @constructor
 * @param {Object} options
 */
function Server(options) {

  var self = this;

  // Load config, and merge with options passed in
  self.config = _.merge({}, DEFAULT_CONFIG, options);
  // Config getter
  self.config.get = function(path, defaultValue) {
    return objectPath.get.call(self, self.config, path, defaultValue);
  };
  // Config setter
  self.config.set = function(path, value) {
    return objectPath.set.call(self, self.config, path, value);
  };

  // Create the express app
  self.app = express();

  // Configure settings for the express app
  self.configureAppSettings();

}

/**
 * Configures the settings for the express app
 * @method configureAppSettings
 * @public
 */
Server.prototype.configureAppSettings = function configureAppSettings() {

  var self = this;
  var app = self.app;
  var config = self.config;

  // Set the app name
  app.set('name', config.get('name'));

  // All environments
  app.set('port', config.get('port'));
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
    winston.info('%s %s %s',
      chalk.bold.red(name),
      chalk.bold.green('listening on port'),
      chalk.bold.red(port));
  });

};

// Export the Server class
module.exports = Server;
