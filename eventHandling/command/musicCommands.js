const discordUtil = require("../../util/discordUtil.js");

// var commands = {
//   "!play" : function(message, params, globals) {
//     if (params[0] != undefined) {
//       var channel = discordUtil.findVoiceChannel(message.author, message.guild);
//
//       if (channel == null) {
//         message.channel.send("Please join a voice channel.");
//         return;
//       }
//
//       channel.join().then(function(connection) {
//
//         discordUtil.playYoutubeVideo(connection, params[0]);
//
//       }).catch(function(err) { // Catch error
//         logUtil.log("Error trying to join voiceChannel.", logUtil.STATUS_ERROR);
//         console.log(err);
//       });
//
//       var result = discordUtil.playYoutubeVideo();
//       if (result != true) {
//         message.channel.send("There was an error trying to play youtube video " + params[0]);
//       }
//     } else {
//       message.channel.send("Please provide the youtube video url.");
//     }
//   }
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
  }
}

module.exports = function(command) {
  return commands[command.toLowerCase()];
}
