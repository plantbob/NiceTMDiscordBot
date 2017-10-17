const fs = require("fs");
const logUtil = require("../../util/logging.js");

// Message = message object that initiated command
// Params = The parameters of the command
// Globals = The global variables for the server that the command was initiated in
var commands = {
  ";;archive" : function(message, params, globals) { // Usage: ;;archive [messages] [file]
    if (message.author.id != 150699865997836288) {
      message.channel.send("Only the Overlord Robot is permitted to run this command.");
    } else if (!params[1]) {
      message.channel.send("You forgot all of the parameters, idiot.")
    } else if (!isNaN(params[0]) && params[0] != "all") {
      message.channel.send("The first parameter is a number, idiot.");
    } else {
      message.channel.send("This may take a while...");

      var inputFile = fs.createWriteStream(params[1]);

      writeMessages(message.id, params[0], inputFile, message.channel, 0);
    }

    return globals;
  },
  ";;s" : function(message, params, globals) { // Usage: ;;archive [messages] [file]
    if (message.author.id != 150699865997836288) {
      // Do nothing
    } else if (!params[3]) {
      message.channel.send("You forgot all of the parameters, idiot.");
    } else {
      var guild = message.client.guilds.get(params[0]);
      if (guild) {
        var channel = guild.channels.get(params[1]);
        if (channel) {
          params.splice(0, 2);
          channel.send(params.join(" "));
        } else {
          message.channel.send("Channel not found.");
        }
      } else {
        message.channel.send("Guild not found.");
      }
    }

    return globals;
  }
}

function writeMessages(before, limit, writeStream, channel, totalMessages) {
  channel.messages.fetch({"before" : before, "limit" : 100}).then(messages => {
    logUtil.log(`Received ${messages.size} messages from channel ${channel.name}.`, logUtil.STATUS_NOTIFICATION);

    var reverseMessages = Array.from(messages);

    if (limit != "all") {
      for (let message of reverseMessages) {
        if (limit <= 0) {
          break;
        }

        var dataToLog = `${new Date(message[1].createdTimestamp).toString()} <${message[1].author.username}> ${message[1].content}\r\n`;
        writeStream.write(dataToLog);
        totalMessages++;
        limit--;
      }
    } else {
      for (let message of reverseMessages) {
        var dataToLog = `${new Date(message[1].createdTimestamp).toString()} <${message[1].author.username}> ${message[1].content}\r\n`;
        writeStream.write(dataToLog);
        totalMessages++;
      }
    }

    if (reverseMessages.length < 100) { // Finished getting all messages
      channel.send(`Finished getting ${totalMessages} messages.`);
    } else {
      writeMessages(reverseMessages[reverseMessages.length - 1][1].id, limit, writeStream, channel, totalMessages);
    }
  }).catch(error => {
    logUtil.log(`Error getting messages.`, logUtil.STATUS_ERROR);
    console.log(error);
  });
}

module.exports.searchFunction = function(command) {
  return commands[command.toLowerCase()];
}

module.exports.close = function(globals, guild) {

}
