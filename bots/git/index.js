// Dependencies
var nconf = require('nconf');

// CONSTANTS
var TOKEN = nconf.get('GITHUB_TOKEN');

module.exports = {

  name: 'gitbot',
  icon: 'https://assets-cdn.github.com/images/modules/logos_page/Octocat.png',
  triggers: ['git', 'gitbot', 'prs', 'gb'],

  handle: function(req, res, next) {
    return next(null, null);
  },

  respond: function(req, res, finalize) {
    return finalize(null, null)
  }
};
