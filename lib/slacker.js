var _ = require('lodash');

var Slacker = function Slacker() {
  this.bots = null;
};

// register the slacker route to be used for this application
Slacker.prototype.registerRoute = function registerRoute(app, prefix) {

  // if no prefix is provided, make sure it is an empty string
  if (typeof prefix !== 'string') {
    prefix = '';
  }

  // create the route with all the middleware
  app.post(prefix + '/slack',
    this._initialize(),
    this._handle(),
    this._respond());
};

// register all of the bots to be used
Slacker.prototype.registerBots = function registerBots(bots) {

  var self = this;
  this.bots = bots || {};

  Object.keys(self.bots).forEach(function(botName) {
    if (self.bots.hasOwnProperty(botName) && !self.bots[botName].hasOwnProperty('name')) {
      self.bots[botName].name = botName;
    }
  });

};

// initialize will set up the slacker data and parse out the incoming slack hook
Slacker.prototype._initialize = function _initialize() {

  var self = this;

  return function(req, res, next) {

    // create the slacker object on req
    req.slacker = req.slacker || {};
    req.slacker.hooks = req.slacker.hooks || {};

    if (req.body.token && req.body.text) {
      // store the incoming hook
      req.slacker.hooks.incoming = _.cloneDeep(req.body);

      // parse out the directive from the text
      var text = req.slacker.hooks.incoming.text;
      var trigger = req.slacker.hooks.incoming.trigger_word;
      var directive = text.replace(new RegExp(trigger, 'i'), '').trim();

      req.slacker.hooks.incoming.directive = directive;
    }

    return next();
  };

};

// handle will determine which bot needs to be used for the current request
Slacker.prototype._handle = function _handle() {

  var self = this;
  var bots = self.bots;

  return function(req, res, next) {

    var trigger = req.slacker.hooks && req.slacker.hooks.incoming && req.slacker.hooks.incoming.trigger_word;

    if (trigger) {
      var bot = req.slacker.bot = _.find(bots, function(bot) {
        return _.contains(bot.triggers, trigger);
      });

      if (bot) {
        if (bot.handle && typeof bot.handle === 'function') {
          bot.handle(req.slacker.hooks.incoming, function(error, data) {
            if (error) {
              return next(error);
            }
            // stash the data returned from the handle call
            req.slacker.data = data;
            return next();
          });
        } else {
          return next(new Error('Bot (' + bot.name + ') does not contain a handler'));
        }
      } else {
        return next(new Error('No bot found matching the trigger ' + trigger));
      }
    } else {
      return next(new Error('No trigger found in incoming hook'));
    }

  };

};

Slacker.prototype._respond = function _respond() {

  var self = this;

  return function(req, res, next) {

    var response = self.buildResponse(req.slacker);

    return res.send(response);

  };

};

Slacker.prototype.buildResponse = function buildResponse(slacker) {

  var self = this;
  var bot = slacker && slacker.bot
  var data = slacker && slacker.data;
  var incoming = slacker && slacker.hooks && slacker.hooks.incoming;
  var response = {};

  if (bot && data) {
    response.username = bot.name;
    response.channel = bot.channel || incoming && incoming.channel_name;

    if (bot.icon) {
      if (!bot.icon.type) {
        bot.icon = self.detectIconType(bot.icon)
      }
      response[bot.icon.type] = bot.icon.icon;
    }

    if (typeof data === 'string') {
      response.text = data;
    } else {
      response.text = data && data.text;
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
