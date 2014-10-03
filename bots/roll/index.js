var slacker = require(process.cwd() + '/lib/slacker');
var Dice = require('node-dice-js');

module.exports = {

  name: 'dicebot',
  icon: 'http://rlv.zcache.com/d20_black_orange_square_stickers-re4e2296c3fb041d881a542d645f6e31f_v9wf3_8byvr_512.jpg',
  triggers: ['roll'],

  handle: function(req, res, next) {
    var stash = req.stash;
    var dice = new Dice();
    var command = stash.hooks.incoming.directive;
    var data = '';

    try {
      data = dice.execute(command);
    } catch(error) {
      data = "No, you go find some dice and roll a " + command;
    }

    next(null, data);
  },

  respond: function(req, res, finalize) {
    var stash = req.stash;
    var data = stash && stash.data;
    var text = data && data.text || data;
    var message = {
      text: text,
      attachments: [{
        text: text,
        color: 'good'
      }]
    };
    return finalize(null, message);
  }

}
