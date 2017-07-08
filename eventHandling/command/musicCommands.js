const discordUtil = require("../../util/discordUtil.js");
const youtubeUtil = require("../../util/youtube.js");
const logUtil = require("../../util/logging.js");

const moment = require("moment");
const Discord = require("discord.js");

module.exports = {};

var songQueue = []; // Stores songs

var commands = {
  ";;play" : function(message, params, globals, updateEmitter) {
    thePlayCommand(message, params, globals, 1);
    updateEmitter.emit('update', message.guild); // Play the song
  },
  ";;earrape" : function(message, params, globals, updateEmitter) {
    thePlayCommand(message, params, globals, 2);
    updateEmitter.emit('update', message.guild);
  },
  ";;nightcore" : function(message, params, globals, updateEmitter) {
    thePlayCommand(message, params, globals, 3);
    updateEmitter.emit('update', message.guild);
  },
  ";;hospital" : function(message, params, globals, updateEmitter) {
    thePlayCommand(message, params, globals, 4);
    updateEmitter.emit('update', message.guild);
  },
  ";;skip" : function(message, params, globals) {
    skipSong(message, globals);
  },
  ";;queue" : function(message, params, globals) {
    discordUtil.getDMChannel(message.author, function(dmChannel) {
      if (!dmChannel) {
        message.reply("Something went wrong with trying to DM you.");
      } else {
        message.reply("Look at your DMs.");
        var musicQueue = globals.get("musicQueue");
        listQueue(dmChannel, musicQueue);
      }
    });
  },
  ";;noice" : function(message, params, globals) { // NOICE
    var timeOfEnd = globals.get("timeOfEnd");

    if (timeOfEnd == -1) { // If no song is playing
      var channel;
      if (message.guild.voiceConnection) {
        channel = message.guild.voiceConnection.channel;
      } else {
        channel = discordUtil.findVoiceChannel(message.author, message.guild);
        if (channel == null) {
          message.channel.send("Please join a voice channel.");
          return;
        }
      }

      channel.join().then(function(connection) {
        discordUtil.playYoutubeVideo(connection, "h3uBr0CCm58", ['volume=50']); // NOICE id
      });
    } else {
      message.reply("A song is currently playing so no.");
    }
  },
  ";;dc" : function(message, params, globals) {
    if (message.guild.voiceConnection && message.member.hasPermission(Discord.Permissions.FLAGS.MANAGE_MESSAGES)) {
      message.guild.voiceConnection.disconnect();

      globals.set("musicQueue", []);
      skipSong(message, globals);
    } else {
      message.channel.send("You need administrator permission to run this command")
    }
  }
}

function listQueue(dmChannel, musicQueue) { // Used in the "!queue" command
  if (!musicQueue) {
    dmChannel.send("There is no music queued");
    return;
  }
  if (musicQueue.length == 0) {
    dmChannel.send("There is no music queued");
    return;
  }

  var messageToSend = "```Current queue : ";
  var totalDuration = 0;
  for (var i in musicQueue) { // Iterate through the queue
    var iPlusOne = parseInt(i) + 1; // parseInt because reasons
    messageToSend += "\n" + (iPlusOne + ". " + musicQueue[i].title + " queued by " + musicQueue[i].user + ". (" + formatDurationHHMMSS(moment.duration(musicQueue[i].duration)) + ")");

    totalDuration += moment.duration(musicQueue[i].duration).asMilliseconds();
  }
  messageToSend += "\nTotal queue length: (" + formatDurationHHMMSS(moment.duration(totalDuration)) + ")";
  messageToSend += "```";

  dmChannel.send(messageToSend);
}

function addToMusicQueue(data, message, globals, channel, type) { // Used in the "!play" command
  channel.join().then(function(connection) {
    message.channel.guild.fetchMember(message.author).then(function(member) { // So we can get the nickname instead of the username
      var musicQueue = globals.get("musicQueue"); // Get queue

      var newSong = {"id" : data.id,
                     "user" : message.author.username,
                     "title" : data.snippet.title,
                     "type" : type,
                     "duration" :  moment.duration(data.contentDetails.duration).asMilliseconds()}

      if (newSong.type == 3 || newSong.type == 4) {
        newSong.duration = Math.floor(newSong.duration / 1.4);
      }

      if (member.nickname != null) {
        newSong.user = member.nickname;
      }

      musicQueue.push(newSong);

      message.channel.send("`" + newSong.user + "` added `" + newSong.title + "` to the queue. `" + formatDurationHHMMSS(moment.duration(newSong.duration)) + "`");

      globals.set("musicQueue", musicQueue); // Set queue

      if (message.deletable) {
        message.delete(); // So the music channel isn't filled with youtube videos
      }
    });
  }).catch(function(err) { // Catch error
    logUtil.log("Error trying to join voiceChannel.", logUtil.STATUS_ERROR);
    console.log(err);
  });
}

function thePlayCommand (message, params, globals, type) { // Is the play command
  if (params[0] != undefined) {
    var channel;
    if (message.guild.voiceConnection) {
      channel = message.guild.voiceConnection.channel;
    } else {
      channel = discordUtil.findVoiceChannel(message.author, message.guild);
      if (channel == null) {
        message.channel.send("Please join a voice channel.");
        return;
      }
    }
    var id = youtubeUtil.getIdFromUrl(params[0]); // Get Id
    if (id == null) {
      youtubeUtil.getVideoDataFromSearchQuery(params.join(" "), "snippet", function(data) { // Iterperet the parameters as a search term
        if (!data) {
          message.channel.send("Invalid search query.");
        } else {
          youtubeUtil.getVideoDataFromId(data.id.videoId, "snippet, contentDetails", function(data) {
            if (!data) {
              message.channel.send("Error: In order for you to be seeing this message shit really had to have hit the fan.");
            } else {
              addToMusicQueue(data, message, globals, channel, type);
            }
          });
        }
      });
    } else {
      youtubeUtil.getVideoDataFromId(id, "snippet, contentDetails", function(data) {
        if (!data) {
          message.channel.send("Invalid youtube link or id.");
        } else {
          addToMusicQueue(data, message, globals, channel, type);
        }
      });
    }
  } else {
    message.channel.send("Please provide the youtube video url or a search term.");
  }
}

function skipSong(message, globals) { // Used in the skip and dc commands
  globals.set("timeOfEnd", -1); // Make the music bot stop playing
  try {
    message.guild.voiceConnection.playFile('non existant mp3.mp3'); // This stops what the bot is playing so it will try to play this mp3
  } catch (exception) {
    // The mp3 doesn't exist so this line will always error
  }
}

module.exports.searchFunction = function(command) {
  return commands[command.toLowerCase()];
}

module.exports.update = function(globals, guild, updateEmitter) {
  var timeOfEnd = globals.get("timeOfEnd");

  if (!timeOfEnd) {
    timeOfEnd = -1;
  }

  if (moment().valueOf() > timeOfEnd) { // The video has ended
    timeOfEnd = -1; // Play the next video on the next playthrough
  }

  if (timeOfEnd == -1) { // No song is playing
    var musicQueue = globals.get("musicQueue");
  //  console.log("Queue:" + musicQueue + " Server: " + guild.name);
    if (!musicQueue) {
      musicQueue = [];
    }

    if (musicQueue.length != 0) { // If there are songs queued
      var songToPlay = musicQueue.shift(); // Get the song
      globals.set("musicQueue", musicQueue); // Set musicQueue

      if (!guild.voiceConnection) {
        musicQueue = []; // Bot isn't connected to a voiceChannel so clear the queue
      } else {
        switch (songToPlay.type) {
          case 1:
            var result = discordUtil.playYoutubeVideo(guild.voiceConnection, songToPlay.id); // Play the video normally
            break;
          case 2:
            var result = discordUtil.playYoutubeVideo(guild.voiceConnection, songToPlay.id, ['volume=50']); // Play the video better
            break;
          case 3:
            var result = discordUtil.playYoutubeVideo(guild.voiceConnection, songToPlay.id, ['atempo=0.7', 'asetrate=r=88200']); // Play the video even better
            break;
          default:
            var result = discordUtil.playYoutubeVideo(guild.voiceConnection, songToPlay.id, ['volume=50', 'atempo=0.7', 'asetrate=r=88200']); // Play the video both better and even better
        }
        if (result instanceof Error) { // Check to see if an error was returned
          logUtil.log("There was an error playing a song.", logUtil.STATUS_ERROR);
          console.log(result);
        } else {
          var durationOfSong = moment.duration(songToPlay.duration).asMilliseconds();
          timeOfEnd = durationOfSong + moment().valueOf(); // Calculate the UNIX timestamp when the video will end
          globals.set("timeOfEnd", timeOfEnd); // Set the timeOfEnd before the song starts playing so it wont start playing another song

          result.on('start', function() { // Reset the timer to account for the delay it took for the stream to start
            globals.set("timeOfEnd", durationOfSong + moment().valueOf());
          });

          result.on('end', function() { // Play the next song when this one ends
            updateEmitter.emit('update', guild);
          });
        }
      }
    }

    globals.set("musicQueue", musicQueue);
  }

  globals.set("timeOfEnd", timeOfEnd);

  return globals; // Pass the updated globals list back
}

function formatDurationHHMMSS(duration) {
  return Math.floor(duration.asHours()) + moment.utc(duration.asMilliseconds()).format(":mm:ss");
}

module.exports.close = function(globals, guild) { // Runs on close
  globals.set("timeOfEnd", -1); // So the bot won't wait while playing nothing
}
