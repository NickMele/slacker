var config = require('./config');
var request = require('request');
var _ = require('lodash');

module.exports = {

  name: config.name,
  icon: config.icon,
  triggers: config.triggers,

  handle: function(slacker, callback) {
    var directive = slacker.directive;
    var url = 'http://api.giphy.com/v1/gifs';
    var qs = {
      api_key: config.api_key
    };

    // if there is a directive, use the search endpoint
    if (directive) {
      url += '/search';
      qs.q = directive;
      qs.limit = 100;
    } else {
      url += '/random';
    }

    request.get({
      url: url,
      qs: qs,
      json: true
    }, function(error, response, body) {
      // get the list of results
      var results = body && body.data;
      // get a random gif from the results
      var random = _.isArray(results) ? _.sample(results) : results;
      // image url
      var image = random && (random.images && random.images.original && random.images.original.url || random.image_url);
      return callback(null, image);
    });

  }
};
