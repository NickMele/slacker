// Dependencies
var Server = require('./lib/server');
var slacker = require('./lib/slacker');
var bots = require('./bots');

// Create a new server
var server = new Server();

// load up the slacker app
slacker.registerBots(bots);
slacker.registerRoute(server.app);

// Start the server
server.start();
