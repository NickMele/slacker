var config = require('./config');
var dice = require('./dice');

module.exports = {

  name: config.name,
  icon: config.icon,
  triggers: config.triggers,

  handle: function(slacker, callback) {
    var command = slacker.directive || 'd20';
    var results = dice.execute(command);

    return callback(null, results);
  }
}
