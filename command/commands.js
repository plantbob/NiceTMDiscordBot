const reddit = require("../util/reddit.js");
const discordUtil = require("../util/discordUtil.js");
const logUtil = require("../util/logging.js");

const ytdl = require("ytdl-core");

var exec = require('child_process').exec;

// Message = message object that initiated command
// Params = The parameters of the command
// Globals = The global variables for the server that the command was initiated in
var commands = {
  "!help" : function(message, params, globals) {
    message.channel.send("Commands: help, ping, oldman, humourme, m, github, genisland, play")
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
          console.log("test");
          message.guild.voiceConnection.disconnect();
        }
        return;
      }
      var voiceChannel = discordUtil.findVoiceChannel(message.author, message.guild);
      if (voiceChannel != null) {
        console.log(voiceChannel.name);

        voiceChannel.join().then(function(connection) {

          var streamOptions = { seek: 0, volume: 1 };
          var stream = ytdl(params[0], { filter : 'audioonly' });
          var dispatcher = connection.playStream(stream, streamOptions);

        }).catch(function(err) { // Catch error
          logUtil.log("Error trying to join voiceChannel.", logUtil.STATUS_ERROR);
          console.log(err);
        });
      } else {
        console.log("No voice channel found.");

        if (message.guild.voiceConnection) {
          message.guild.voiceConnection.disconnect();
        }
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
  "!play" : function(message, params, globals) {
    if (params[0] != undefined) {
      var channel = discordUtil.findVoiceChannel(message.author, message.guild);

      if (channel == null) {
        message.channel.send("Please join a voice channel.");
        return;
      }

      channel.join().then(function(connection) {

        discordUtil.playYoutubeVideo(connection, params[0]);

      }).catch(function(err) { // Catch error
        logUtil.log("Error trying to join voiceChannel.", logUtil.STATUS_ERROR);
        console.log(err);
      });

      var result = discordUtil.playYoutubeVideo();
      if (result != true) {
        message.channel.send("There was an error trying to play youtube video " + params[0]);
      }
    } else {
      message.channel.send("Please provide the youtube video url.");
    }
  }
}

module.exports = function(command) {
  return commands[command.toLowerCase()];
}
