const ytdl = require("ytdl-core");
const stream = require('stream');

module.exports = {};

module.exports.findVoiceChannel = function(user, guild) { // Returns the voice channel the user is currently on, null if the user isn't on a voice channel
  var channels = Array.from(guild.channels.values()); // Get channels in guild
  for (var k in channels) {
    if (channels[k].type == "voice") { // If channel is voice channel
      var members = Array.from(channels[k].members.values()); // Get members in voice channel
      for (var l in members) {
        if (members[l].user = user) { // If message author is in voice channel
          return channels[k];
        }
      }
    }
  }

  return null; // Nothing found
}

module.exports.playYoutubeVideo = function(connection, video) { // Will play the youtube video through the voiceConnection, will return true if success and the exception if fail
  //try {
    var streamOptions = { seek: 0, volume: 1 };
    var stream = ytdl(video, { filter : 'audioonly' });

    console.log("test3");
    var logStream = new stream.Writable();
    logStream._write = function (chunk, encoding, data) {
      console.log("Log data: " + chunk.toString());
      done(chunk);
    }

    console.log("test");
    stream.pipe(logStream);
    console.log("test2");

    var dispatcher = connection.playStream(stream, streamOptions);
  //} catch (exception) {
    if (exception.name != "TypeError") {
      return exception; // It always throws a TypeError so just return true
    }
  //}
  return true;
}
