var Dice = require('node-dice-js');

module.exports = {

  name: 'dicebot',
  icon: 'http://rlv.zcache.com/d20_black_orange_square_stickers-re4e2296c3fb041d881a542d645f6e31f_v9wf3_8byvr_512.jpg',
  triggers: ['roll'],

  handle: function(req, res, respond) {
    var slacker = req.slacker;
    var dice = new Dice();
    var command = slacker.hooks.incoming.directive;
    var data = '';

    try {
      data = dice.execute(command);
    } catch(error) {
      data = "No, you go find some dice and roll a " + command;
    }

    return respond(null, data);
  },

  respond: function(req, res, send) {
    var slacker = req.slacker;
    var data = slacker && slacker.data;
    var text = data && data.text || data;
    var message = {
      text: text,
      attachments: [{
        text: text,
        color: 'good'
      }]
    };
    return send(null, message);
  }
}
