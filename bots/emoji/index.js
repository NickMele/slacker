module.exports = {

  name: 'emojibot',
  icon: 'http://www.free-emoticons.com/files/avatar-emoticons/2423.png',
  triggers: ['emoji', 'moji', 'emoti'],

  handle: function(req, res, next) {
    return next(null, null);
  },

  respond: function(req, res, finalize) {
    return finalize(null, null)
  }
};
