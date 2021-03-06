// Dependencies
var slacker = require('./lib/slacker');
var nconf = require('nconf');

nconf.env().file({file:'config.json'});

var bots = require('./bots');
var options = {
  name: 'Slackerz',
  port: process.env.PORT || 3000,
  bots: bots
};

// Setup slacker
slacker.setup(options);

// Start slacking
slacker.slack();
