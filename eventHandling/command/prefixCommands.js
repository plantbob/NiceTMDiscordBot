const Discord = require("discord.js");

// Message = message object that initiated command
// Params = The parameters of the command
// Globals = The global variables for the server that the command was initiated in
var commands = {
  ";;changeprefix" : function(message, params, globals) {
    if (!params[0]) {
      message.channel.send("You need to specify a prefix to change to.");
    } else if (!message.member.hasPermission(Discord.Permissions.FLAGS.ADMINISTRATOR)) { // You need ADMINISTRATOR permission to run this command
      message.channel.send("You need administrator permission to run this command.");
    } else if (params[1]) {
      message.channel.send("Prefixes can't have spaces");
    } else {
      globals.set("prefix", params[0]);

      message.channel.send("Prefix changed to: `" + params[0] + "`");
    }

    return globals;
  },
  ";;resetprefix" : function(message, params, globals) {
    if (message.member.hasPermission(Discord.Permissions.FLAGS.ADMINISTRATOR)) {
      globals.set("prefix", ";;");

      message.channel.send("Prefix has been reset to: `;;`");
    } else {
      message.channel.send("You need administrator permission to run this command.");
    }

    return globals;
  }
}

module.exports.searchFunction = function(command) {
  return commands[command.toLowerCase()];
}

module.exports.close = function(globals, guild) {

}
