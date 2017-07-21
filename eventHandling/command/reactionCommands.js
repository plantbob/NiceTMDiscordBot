const Discord = require("discord.js");

// Message = message object that initiated command
// Params = The parameters of the command
// Globals = The global variables for the server that the command was initiated in
var commands = {
  "nice": '™'
}

module.exports.searchFunction = function(command) {
  var lowerCase = command.toLowerCase();

  if (commands[lowerCase]) {
    return function(message, params, globals) {
      if (params[0] == null) {
        message.react(commands[lowerCase]);
      }
    };
  }
}

module.exports.close = function(globals, guild) {

}
