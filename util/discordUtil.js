const ytdl = require("ytdl-core");
const PassThrough = require('stream').PassThrough;
const fs = require('fs');
const ffmpeg = require('fluent-ffmpeg');

const logUtil = require("./logging.js");

const tempDir = __dirname.substring(0, __dirname.length - 5) + "\\temp\\";

const miscConfig = require("../config/misc.js");

module.exports = {};

module.exports.playYoutubeVideo = function(connection, video, audioFilters, complexFilters) { // Will play the youtube video through the voiceConnection, will return true if success and the exception if fail
  try {
    var streamOptions = { seek: 0, volume: 1 , passes: miscConfig.playStreamPasses};
    var audioStream;

    if ((audioFilters && audioFilters.length > 0) && (complexFilters && complexFilters.length > 0)) {
      var rawAudioStream = ytdl(video, { filter : 'audioonly' });

      audioStream = ffmpeg(rawAudioStream)
      .withAudioCodec('libvorbis')
      .audioFilters(audioFilters) // Add audio filters
      .complexFilter(complexFilters)
      .format('webm');
    } else if (!(audioFilters && audioFilters.length > 0) && (complexFilters && complexFilters.length > 0)) {
        var rawAudioStream = ytdl(video, { filter : 'audioonly' });

        audioStream = ffmpeg(rawAudioStream)
        .withAudioCodec('libvorbis')
        .complexFilter(complexFilters)
        .format('webm');
    } else if ((audioFilters && audioFilters.length > 0) && !(complexFilters && complexFilters.length > 0)) {
        var rawAudioStream = ytdl(video, { filter : 'audioonly' });

        audioStream = ffmpeg(rawAudioStream)
        .withAudioCodec('libvorbis')
        .audioFilters(audioFilters) // Add audio filters
        .format('webm');
    } else {
      audioStream = ytdl(video, { filter : 'audioonly' });
    }

    audioStream.on('error', function(error) {
      logUtil.log("Error in stream.");
      console.log(error);
    });

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

module.exports.recordAudio = function(connection, guild, callback) { // Callback is given the file name and the user
  var receiver = connection.createReceiver();

  function onSpeaking(user, speaking) {
    var fileName = user.username + "_" + guild.id + "_" + Date.now();

    var rawPCMStream = receiver.createPCMStream(user);
    var outFileStream = fs.createWriteStream("./pcm/" + fileName + ".wav");

    rawPCMStream.on("end", function() {
        callback(fileName, user);
    });

    ffmpeg(rawPCMStream) // Read from the raw pcm file
    .audioFilters('aresample=16000')
    .inputFormat('s32le')
    .toFormat('wav')
    .pipe(outFileStream);
  }

  connection.on('speaking', onSpeaking);
}

module.exports.isChannelNSFW = function(channel) {
  if (channel.nsfw) return true;

  return (/^nsfw(-|$)/.test(channel.name));
}

module.exports.getAvatarURL = function(query, guild, sizeOfAvatar) { // Gets avatar url from string and guild
      var member = guild.members.find(member => member.user.username == query);
      if (member) {
          var avatarURL = member.user.avatarURL({size: sizeOfAvatar, format: "jpg"});
          if (avatarURL) {
              return avatarURL;
          } else {
              return null;
          }
      } else {
          member = guild.members.find("nickname", query);
          if (member) {
              var avatarURL = member.user.avatarURL({size: sizeOfAvatar, format: "jpg"});
              if (avatarURL) {
                  return avatarURL;
              } else {
                  return null;
              }
          } else {
            return null;
          }
      }
  
}