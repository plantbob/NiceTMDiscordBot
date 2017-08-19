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

module.exports.searchFunction = function(command) {
  if (command[0] == 'n' && command.length >= 4) {
    var isNice = false;
    var lastChar = 'n';
    for (var i = 1; i < command.length; i++) {
      var currentChar = command[i];

      if (lastChar == currentChar) {
      } else if (lastChar == 'n' && currentChar == 'i') {
      } else if (lastChar == "i" && currentChar == "c") {
      } else if (lastChar == "c" && currentChar == "e") {
        isNice = true;
      } else {
        isNice = false;
        break;
      }

      lastChar = currentChar;
    }

    if (isNice) {
      return reactWithTM;
    }
  }

  return commands[command.toLowerCase()];
}

module.exports.close = function(globals, guild) {

}
