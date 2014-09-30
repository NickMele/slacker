// Dependencies
var Slacker = require('./lib/slacker');
var bots = require('./bots');

var options = {
  name: 'Slackerz',
  port: process.env.PORT || 3000,
  bots: bots
};

// Create a slacker
var slacker = new Slacker(options);

// Start slacking
slacker.slack();
