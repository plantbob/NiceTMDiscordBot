const Discord = require("discord.js");

// Message = message object that initiated command
// Params = The parameters of the command
// Globals = The global variables for the server that the command was initiated in
var commands = {
  "deja" : function(message, params, globals) {
    if (params[0].toLowerCase() == "vu?" && !params[1]) {
      message.react("🇩").then(function() {
        message.react("🇷").then(function() {
          message.react("🇮").then(function() {
            message.react("🇫").then(function() {
              message.react("🇹");
            });
          });
        });
      });
    }
  }
}

function reactWithTM(message, params, globals) {
  if (params[0] == null) {
    message.react('™');
  }
}

var isNice = /[n]n*[i]i*[c]c*[e]e*/;

module.exports.searchFunction = function(command) {
  command = command.toLowerCase();

  if (isNice.test(command)) {
    return reactWithTM;
  }

  return commands[command];
}

module.exports.close = function(globals, guild) {

}
