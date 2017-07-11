const ytdl = require("ytdl-core");
const PassThrough = require('stream').PassThrough;
const fs = require('fs');
const ffmpeg = require('fluent-ffmpeg');

const logUtil = require("./logging.js");

const tempDir = __dirname.substring(0, __dirname.length - 5) + "\\temp\\";

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

module.exports.playYoutubeVideo = function(connection, video, audioFilters, complexFilters) { // Will play the youtube video through the voiceConnection, will return true if success and the exception if fail
  try {
    var streamOptions = { seek: 0, volume: 1 };
    var audioStream;

    if ((audioFilters && audioFilters.length > 0) || (complexFilters && complexFilters.length > 0)) {
      var rawAudioStream = ytdl(video, { filter : 'audioonly' });

      audioStream = ffmpeg(rawAudioStream)
      .withAudioCodec('libvorbis')
      .audioFilters(audioFilters || []) // Add audio filters
      .complexFilter(complexFilters || [])
      .format('webm');
    } else {
      audioStream = ytdl(video, { filter : 'audioonly' });
    }

    var dispatcher = connection.playStream(audioStream, streamOptions);

    return dispatcher;
  } catch (exception) {
    if (exception.name != "TypeError") {
      return exception; // It always throws a TypeError so just return true
    }
  }
}

module.exports.getDMChannel = function(user, callback) { // Attempts to get DM channel and makes new one if one doesn't already exist
  var dmChannel = user.dmChannel;
  if (!dmChannel) {
    user.createDM().then(function (dmChannel) { // Make the dm channel if one doesn't exist
      callback(dmChannel);
    }).catch(function (exception) {
      callback(false);
    });
    return;
  }

  callback(dmChannel);
}

// function getRandomInt(min, max) {
//   min = Math.ceil(min);
//   max = Math.floor(max);
//   return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
// }
