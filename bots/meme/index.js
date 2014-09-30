var config = require('./config');
var request = require('request');
var _ = require('lodash');
var URL = require('url');

module.exports = {

  name: config.name,
  icon: null,
  triggers: config.triggers,

  handle: function(slacker, callback) {
    var directive = slacker.directive;
    var query = 'meme:' + directive;
    var url = 'https://api.imgur.com/3/gallery/search/top/';
    var windows = ['day', 'week', 'month', 'year', 'all'];

    // determine what url to use
    if (!directive) {
      url = 'https://api.imgur.com/3/g/memes/top/';
    }

    // to make the search a little more random, choose a random window
    url = URL.resolve(url, _.sample(windows));

    request.get({
      url: url,
      json: true,
      qs: {
        q: query
      },
      headers: {
        'Authorization': 'Client-ID ' + config.client_id
      }
    }, function(error, response, json) {
      // get the list of results
      var results = json.data;
      // reject all albums and nsfw images
      var images = _.filter(results, function(image) {
        return !image.is_album && image.nsfw !== true;
      });
      // get a random result
      var random = _.sample(images);
      // get the link
      var link = random && random.link;
      return callback(null, link);
    });

  }
}

