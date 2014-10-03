var Server = require(process.cwd() + '/lib/server');
var _ = require('lodash');
var winston = require('winston');
var chalk = require('chalk');
var objectPath = require('object-path');
var request = require('request');

// CONSTANTS
var DEFAULT_CONFIG = require('./config');

var Slacker = function Slacker() {

    this.config = {};

};

Slacker.prototype.setup = function setup(options) {

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

}

// Creates an express server, attaches the route and starts the server
Slacker.prototype.slack = function slack() {

  var self = this;
  var config = self.config;
  var options = {};

  // set the server name to the slacker name
  options.name = config.get('name');

  // set the server port
  options.port = config.get('port');

  // Create a server instance just for this slacker
  var server = new Server(options);

  // Register the bots
  self.registerBots();

  // Register the routes with the server
  self.registerRoute(server.app);

  // Start the server
  server.start();
}

// register the slacker route to be used for this application
Slacker.prototype.registerRoute = function registerRoute(app) {

  var self = this;
  var name = self.config.get('name');

  // get the route path
  var path = self.config.get('prefix', '/slack');

  winston.info('%s is registering route %s', chalk.bold.red(name), chalk.bold.red(path));

  // Make sure we have an app to attach our route to
  if (!(app && app.post)) {
    throw new Error('No server registered to attach the slacker route to');
  }

  // create the route with all the middleware
  app.post(path,
    self.initialize(),
    self.handle(),
    self.respond());
};

// register all of the bots to be used
Slacker.prototype.registerBots = function registerBots() {

  var self = this;
  var config = self.config;
  var name = config.get('name');

  // store reference to the bots for quick access
  self.bots = config.get('bots', {}) || {};

  winston.info('%s is registering bots', chalk.bold.red(name));

  _.keys(self.bots).forEach(function(botName) {
    winston.info('%s bot ready!', chalk.bold.blue(botName));
    if (self.bots.hasOwnProperty(botName) && !self.bots[botName].hasOwnProperty('name')) {
      self.bots[botName].name = botName;
    }
  });

};

// initialize will set up the slacker data and parse out the incoming slack hook
Slacker.prototype.initialize = function initialize() {

  var self = this;

  return function(req, res, next) {

    // create the stash object on req
    req.stash = req.stash || {};
    req.stash.hooks = req.stash.hooks || {};

    if (req.body.token && req.body.text) {
      // store the incoming hook
      req.stash.hooks.incoming = _.cloneDeep(req.body);

      // parse out the directive from the text
      var text = req.stash.hooks.incoming.text;
      var trigger = req.stash.hooks.incoming.trigger_word;
      var directive = text.replace(new RegExp(trigger, 'i'), '').trim();

      req.stash.hooks.incoming.directive = directive;
    }

    return next();
  };

};

// handle will determine which bot needs to be used for the current request
Slacker.prototype.handle = function handle() {

  var self = this;
  var bots = self.bots;

  return function(req, res, next) {

    var trigger = req.stash.hooks && req.stash.hooks.incoming && req.stash.hooks.incoming.trigger_word;

    if (trigger) {
      var bot = req.stash.bot = _.find(bots, function(bot) {
        return _.contains(bot.triggers, trigger);
      });

      if (bot) {
        if (bot.handle && typeof bot.handle === 'function') {
          bot.handle(req, res, function(error, data) {
            if (error) {
              return next(error);
            }
            // stash the data returned from the handle call
            req.stash.data = data;
            return next();
          });
        } else {
          return next(new Error('Bot (' + bot.name + ') does not contain a handler'));
        }
      } else {
        return next(new Error('No bot found to handle the trigger ' + trigger));
      }
    } else {
      return next(new Error('No trigger found in incoming hook from slack'));
    }

  };

};

Slacker.prototype.respond = function respond() {

  var self = this;

  return function(req, res, next) {

    var bot = req.stash && req.stash.bot;
    if (bot && bot.respond && typeof bot.respond === 'function') {
      bot.respond(req, res, function(error, message) {
        var payload = self.buildResponse(req.stash, message);
        return res.status(200).send(payload);
      });
    }

  };

};

Slacker.prototype.send = function send(req, res, data) {

  var self = this;
  var bot = req.stash && req.stash.bot;

  if (bot && bot.send && typeof bot.send === 'function') {
    bot.send(req, res, function(error, message) {
      var payload = self.buildResponse(req.stash, message);
      self.push(payload);
    });
  }

};

Slacker.prototype.push = function push(payload) {

  var self = this;
  var config = self.config;
  var outgoing = config.get('outgoing');
  var body = {
    payload: JSON.stringify(payload)
  };

  _.forEach(outgoing, function(url) {
    request.post({
      url: url,
      form: body
    }, function(error, response, body) {
      console.log(error, body)
    });
  });

};

Slacker.prototype.buildResponse = function buildResponse(stash, message) {

  var self = this;
  var bot = stash && stash.bot;
  var incoming = stash && stash.hooks && stash.hooks.incoming;
  var response = {};

  if (bot && message) {
    response.username = bot.name;
    response.channel = bot.channel || incoming && incoming.channel_name;

    if (bot.icon) {
      if (!bot.icon.type) {
        bot.icon = self.detectIconType(bot.icon);
      }
      response[bot.icon.type] = bot.icon.icon;
    }

    if (typeof message === 'string') {
      response.text = message;
    } else {
      response = _.merge(response, message);
    }
  }

  return response;

}

Slacker.prototype.detectIconType = function detectIconType(iconName) {
  var isEmoji = /^:.+:$/.test(iconName);
  var isUrl = /^http.+\.[a-z]{3}$/.test(iconName);
  var icon = {
    icon: iconName
  };

  if (!iconName) {
    return {};
  } else if (isEmoji) {
    icon.type = 'icon_emoji';
  } else if (isUrl) {
    icon.type = 'icon_url';
  }

  return icon;
}

module.exports = new Slacker();
