const discordUtil = require("../../util/discordUtil.js");
const youtubeUtil = require("../../util/youtube.js");

// var commands = {
//
// }

var commands = {
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
  },
  "!testplay" : function(message, params, globals) {
    if (params[0] != undefined) {
      var channel = discordUtil.findVoiceChannel(message.author, message.guild);

      if (channel == null) {
        message.channel.send("Please join a voice channel.");
        return;
      }

      var id = youtubeUtil.getIdFromUrl(params[0]); // Get Id
      if (!id) {
        message.channel.send("Invalid youtube link or id.");
      } else {
        youtubeUtil.getVideoSnippetFromId(id, function(snippet) {
          if (!snippet) {
            message.channel.send("Invalid youtube link or id.");
          } else {
            message.channel.send("Added `" + snippet.title + "` to the queue."); // TODO: Actually add to queue

            channel.join().then(function(connection) {

            }).catch(function(err) { // Catch error
              logUtil.log("Error trying to join voiceChannel.", logUtil.STATUS_ERROR);
              console.log(err);
            });
          }
        });
      }
    } else {
      message.channel.send("Please provide the youtube video url.");
    }
  }
}

module.exports = function(command) {
  return commands[command.toLowerCase()];
}
