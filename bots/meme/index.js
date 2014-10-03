var request = require('request');
var _ = require('lodash');
var URL = require('url');

// Constants
var CLIENT_ID = '08f9ef1767ed8c4';
var CLIENT_SECRET = '417feb8616cbc4f8c3d130373822d536da418e2d';

module.exports = {

  name: 'meme',
  triggers: ['meme'],

  handle: function(req, res, next) {
    var stash = req.stash
    var directive = stash.directive;
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
        'Authorization': 'Client-ID ' + CLIENT_ID
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
      return next(null, link);
    });

  },

  respond: function(req, res, finalize) {
    var stash = req.stash;
    var data = stash && stash.data;
    var message = data && data.text || data;
    return finalize(null, message);
  }
}

