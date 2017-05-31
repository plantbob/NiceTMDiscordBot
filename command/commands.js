var reddit = require("../util/reddit.js");

// Message = message object that initiated command
// Params = The parameters of the command
// Globals = The global variables for the server that the command was initiated in
var commands = {
  "!help" : function(message, params, globals) {
    message.channel.send("Commands: help, ping, oldman, humourme, m, github")
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
  },
  "!humourme" : function(message, params, globals) {
    reddit.getRandomUrl("funny", function(url) {
      if (url) {
        message.channel.send(url);
      } else {
        message.channel.send("There was an error reaching /r/funny. Blame Finland.");
      }
    });
  },
  "!m" : function(message, params, globals) {
    if (message.channel.name.indexOf("nsfw") != -1) { // Check to see if channel name has nsfw
      if (params[0]) {
        reddit.getRandomUrl(params[0], function(url) {
          if (url) {
            message.channel.send(url);
          } else {
            message.channel.send("There was an error reaching /r/" + params[0] + ". Blame Finland.");
          }
        });
      } else {
        message.channel.send("Give me the subreddit name damnit!");
      }
    } else {
      message.channel.send("Please add nsfw to the channel name, this is reddit afterall.");
    }
  },
  "!github" : function(message, params, globals) {
    message.channel.send("https://github.com/tjpc3/NiceTMDiscordBot");
  }
}

module.exports = function(command) {
  return commands[command.toLowerCase()];
}
