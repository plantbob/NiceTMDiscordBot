const ytdl = require("ytdl-core");
const stream = require('stream');
const fs = require('fs');
const ffmpeg = require('fluent-ffmpeg');

const logUtil = require("./logging.js");

const Duplex = require('stream').Duplex;

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

module.exports.playYoutubeVideo = function(connection, video, audioFilters) { // Will play the youtube video through the voiceConnection, will return true if success and the exception if fail
  try {
    var streamOptions = { seek: 0, volume: 1 };
    var audioStream;

    if (audioFilters && audioFilters.length > 0) {
      var rawAudioStream = ytdl(video, { filter : 'audioonly' });

      audioStream = ffmpeg(rawAudioStream)
      .withAudioCodec('libvorbis')
      .audioFilters(audioFilters) // Add audio filters
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

module.exports.playYoutubeVideoWaitFilter = function(connection, video, audioFilters, waitTime) { // Plays youtbue video and applys audioFilters after specified waitTime
  try {
    var streamOptions = { seek: 0, volume: 1 };
    var audioStream;

    var rawAudioStream = ytdl(video, { filter : 'audioonly' });

    var randFilename = "S" + Math.random() + ".webm";

    var modifiedAudioStream = ffmpeg(rawAudioStream)
    .withAudioCodec('libvorbis')
    .audioFilters(audioFilters) // Add audio filters
    .setStartTime(waitTime) // Cut the first specified seconds
    .format('webm')
    .output(randFilename); // Save the random file

    var cutAudioStream = ffmpeg(rawAudioStream)
    .withAudioCodec('libvorbis')
    .setDuration(waitTime) // Cut this to the specified seconds
    .format('webm');

    var completedAudioStream = ffmpeg(cutAudioStream)
    .withAudioCodec('libvorbis')
    .input(randFilename) // Add the modified audio stream to the end
    .format('webm');

    var dispatcher = connection.playStream(completedAudioStream, streamOptions);

    dispatcher.on("end", function() {
      fs.unlinkSync(randFilename); // Delete the file when the bot closes
    });

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
