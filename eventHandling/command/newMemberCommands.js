const Discord = require("discord.js");

// Message = message object that initiated command
// Params = The parameters of the command
// Globals = The global variables for the server that the command was initiated in
var commands = {
  ";;setjoinmessage" : function(message, params, globals) {
    if (params[0]) {
      if (message.member.hasPermission(Discord.Permissions.FLAGS.ADMINISTRATOR)) {
        var joinMessage = params.join(" ");
        globals.set("newMemberMessage", joinMessage);
        globals.set("newMemberMessageChannel", message.channel.id);
        message.channel.send("Join message set to: " + joinMessage);
      } else {
        message.reply("You need to be an administrator to run this command.");
      }
    } else {
      message.channel.send("Please specify a join message.");
    }
  },
  ";;removejoinmessage" : function(message, params, globals) {
    if (message.member.hasPermission(Discord.Permissions.FLAGS.ADMINISTRATOR)) {
      message.channel.send("Join message removed!");
      globals.set("newMemberMessage", undefined);
    } else {
      message.reply("You need to be an administrator to run this command.");
    }
  }
}

module.exports.searchFunction = function(command) {
  return commands[command.toLowerCase()];
}

module.exports.close = function(globals, guild) {

}
