const ytdl = require("ytdl-core");
const stream = require('stream');
const fs = require('fs');

const logUtil = require("./logging.js");

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

const ebml = require('ebml');

module.exports.playYoutubeVideo = function(connection, video) { // Will play the youtube video through the voiceConnection, will return true if success and the exception if fail
  //try {
    var streamOptions = { seek: 0, volume: 1 };
    var audioStream = ytdl(video, { filter : 'audioonly' });

    // audioStream.pipe(logUtil.logStream());
    // var logText = fs.createWriteStream("sound.txt");
    // audioStream.pipe(logText);

    const decoder = new ebml.Decoder();
    const encoder = new ebml.Encoder();

    audioStream.pipe(decoder);

    decoder.on('data', function(chunk) {
      //console.log(chunk);
      try {
        if (chunk[1].name == "SimpleBlock") {
          var tempBuffer = Buffer.alloc(chunk[1].dataSize, chunk[1].data);

          for (var i = 5; i < chunk[1].dataSize; i++) {
            if (getRandomInt(1, 20) == -1)  {
              tempBuffer.writeUIntBE(getRandomInt(0, 255), i, 1);
            }
          }

          chunk[1].data = tempBuffer;
        }
      } catch (exception) {
      }

      encoder.write(chunk);
    });

    var dispatcher = connection.playStream(encoder, streamOptions);
  // } catch (exception) {
  //   if (exception.name != "TypeError") {
  //     return exception; // It always throws a TypeError so just return true
  //   }
  // }
  return true;
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
}
