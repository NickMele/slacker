var config = require('./config');

module.exports = {

  name: config.name,
  icon: config.icon,
  triggers: config.triggers,

  handle: function(slacker, callback) {



    return callback(null, '');
  }
};
