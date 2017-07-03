const reddit = require("../../util/reddit.js");
const logUtil = require("../../util/logging.js");

var exec = require('child_process').exec;

// Message = message object that initiated command
// Params = The parameters of the command
// Globals = The global variables for the server that the command was initiated in
var commands = {
  "!help" : function(message, params, globals) {
    message.channel.send("Commands: help, ping, oldman, humourme, m, github, genisland, play, earrape, nightcore, noice, skip, queue, link");
  },
  "!ping" : function(message, params, globals) {
    message.channel.send("Pong!");
  },
  "nice" : function(message, params, globals) {
    if (params[0] == null) {
      message.react('™');
    }
  },
  "!oldman" : function(message, params, globals) { // To test parameters
    if (!params[0]) {
      message.channel.send("What did you say? Say something afterwards for a change!");
    } else {
      message.channel.send("Get off my lawn! And take your " + params.join(" ") + " with you!");
    }
  },
  "!humourme" : function(message, params, globals) {
    reddit.getRandomUrl("i_irl", function(url) {
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
  },
  "!genisland" : function(message, params, globals) {
    message.channel.send("One island coming up!");
    var child = exec('java -jar ./jars/genisland.jar',
      function (error, stdout, stderr) {
        if(error !== null){
          console.log("Error running Jar file: " + error);
          message.channel.send("Error: Shit hit the fan.");
          return;
        }

        message.channel.send("", {files: ["map.jpg"]});
    });
  },
  "!test" : function(message, params, globals) {
    if (message.author.username != "tjpc3") {
      message.reply("Only the Robot Overlord is permitted to run this command.");
    } else {
      if (params[0] == "dc") {
        if (message.guild.voiceConnection != null) {
          message.guild.voiceConnection.disconnect();
        }
        return;
      }
    }
  },
  "!count" : function(message, params, globals) {
    var count = globals.get("count");
    if (count == undefined) {
      globals.set("count", 0);
      count = 0;
    } else {
      globals.set("count", count + 1);
      count++;
    }

    message.channel.send("Current count for this server is " + count + "!");

    return globals;
  },
  "!link" : function(message, params, globals) {
    message.channel.send("Here's the link: https://discordapp.com/oauth2/authorize?&client_id=318558676241874945&scope=bot&permissions=0 Add me to your server whydontcha?");
  }
}

module.exports.searchFunction = function(command) {
  return commands[command.toLowerCase()];
}

module.exports.loop = function(globals, guild) {

}

module.exports.close = function(globals, guild) {

}
