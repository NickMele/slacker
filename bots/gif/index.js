var request = require('request');
var _ = require('lodash');

module.exports = {

  name: 'gifbot',
  icon: null,
  triggers: ['gif'],

  handle: function(req, res, next) {
    var stash = req.stash
    var directive = stash.directive;
    var url = 'http://api.giphy.com/v1/gifs';
    var qs = {
      api_key: 'dc6zaTOxFJmzC'
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
      return next(null, image);
    });

  },

  respond: function(req, res, finalize) {
    var stash = req.stash;
    var data = stash && stash.data;
    var message = data && data.text || data;
    return finalize(null, message);
  }
};
