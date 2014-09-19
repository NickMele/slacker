var config = require('./config');
var Dice = require('node-dice-js');

module.exports = {

  name: config.name,
  icon: config.icon,
  triggers: config.triggers,

  handle: function(slacker, callback) {
    var dice = new Dice();
    var command = slacker.directive;
    var results = '';

    try {
      results = dice.execute(command);
    } catch(error) {
      results = "No, you go find some dice and roll a " + command;
    }

    return callback(null, results);
  }
}
