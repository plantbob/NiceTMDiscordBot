// Message = message object that initiated command
// Params = The parameters of the command
// Globals = The global variables for the server that the command was initiated in
var commands = {
  "!help" : function(message, params, globals) {
    message.channel.send("Commands: help, ping, oldman")
  },
  "!ping" : function(message, params, globals) {
    message.channel.send("Pong!");
  },
  "nice" : function(message, params, globals) {
    message.react('™');
  },
  "!oldman" : function(message, params, globals) { // To test parameters
    if (!params[0]) {
      message.channel.send("What did you say? Say something afterwards for a change!");
    } else {
      message.channel.send("Get off my lawn! And take your " + params.join(" ") + " with you!");
    }
  }
}

module.exports = function(command) {
  return commands[command.toLowerCase()];
}
