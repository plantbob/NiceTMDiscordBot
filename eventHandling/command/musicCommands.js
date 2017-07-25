const discordUtil = require("../../util/discordUtil.js");
const youtubeUtil = require("../../util/youtube.js");
const logUtil = require("../../util/logging.js");
const pocketsphinxUtil = require("../../util/pocketsphinx.js");

const moment = require("moment");
const Discord = require("discord.js");

const ffmpeg = require("fluent-ffmpeg");

var fs = require('fs');

var token = require('../../config/token.js');

module.exports = {};

var songQueue = []; // Stores songs

var commands = {
  ";;play" : function(message, params, globals, updateEmitter) {
    thePlayCommand(message, params, globals, 1);
    //updateEmitter.emit('update', message.guild); // Play the song
  },
  ";;earrape" : function(message, params, globals, updateEmitter) {
    thePlayCommand(message, params, globals, 2);
    //updateEmitter.emit('update', message.guild);
  },
  ";;nightcore" : function(message, params, globals, updateEmitter) {
    thePlayCommand(message, params, globals, 3);
    //updateEmitter.emit('update', message.guild);
  },
  ";;hospital" : function(message, params, globals, updateEmitter) {
    thePlayCommand(message, params, globals, 4);
    //updateEmitter.emit('update', message.guild);
  },
  ";;madness" : function(message, params, globals) {
    var time = parseInt(params.shift());
    if (!time || time < 0) {
      message.channel.send("Invalid time.");

      if (message.deletable) {
        message.delete();
      }
    } else {
      thePlayCommand(message, params, globals, "T" + time); // Play song with encoded time in the type
    }
  },
  ";;skip" : function(message, params, globals) {
    if (message.guild.voiceConnection) {
      var musicQueue = globals.get("musicQueue");

      if (message.guild.voiceConnection.dispatcher) {
        console.log(message.guild.voiceConnection.dispatcher);
        if (musicQueue.length > 1) {
          musicQueue.unshift(musicQueue[0]); // Duplicate the song in the front to counteract the double-skip
          globals.set("musicQueue", musicQueue);
        }

        endSong(message, globals);
      } else if (globals.get('playing')) { // If we're in between songs
        console.log("test3");
        musicQueue.shift();
        globals.set("musicQueue", musicQueue);
      } else {
        message.channel.send("I'm not playing anything.");
      }
    } else {
      message.channel.send("I'm not in a voice channel.");
    }
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
    var playing = globals.get("playing");

    if (playing == false) { // If no song is playing
      var channel;
      if (message.guild.voiceConnection) {
        channel = message.guild.voiceConnection.channel;
      } else {
        //channel = discordUtil.findVoiceChannel(message.author, message.guild);
        channel = message.member.voiceChannel;
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
      globals.set("musicQueue", []);

      endSong(message, globals);
      message.guild.voiceConnection.disconnect();
      globals.set("playing", false);
    } else {
      message.channel.send("You need administrator permission to run this command")
    }
  },
  ";;listen" : function(message, params, globals) {
    if (message.author.id != 150699865997836288) { // My id
      message.reply("No.");
      return;
    }

    var channel;
    if (message.guild.voiceConnection) {
      channel = message.guild.voiceConnection.channel;
    } else {
      channel = message.member.voiceChannel;
      if (channel == null) {
        message.channel.send("Please join a voice channel.");
        return;
      }
    }

    channel.join().then(function(connection) {
      var receiver = connection.createReceiver();

      discordUtil.recordAudio(connection, message.guild, function(fileName, user) {
        pocketsphinxUtil.analyze("pcm/" + fileName + ".wav", function(transcript) {
          if (transcript) {
            message.channel.send("`" + user.username + "` said `" + transcript + "`");
          }
        });
      });
    });
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
  function onChannelJoin(connection) {
    message.channel.guild.fetchMember(message.author).then(function(member) { // So we can get the nickname instead of the username
      var musicQueue = globals.get("musicQueue"); // Get queue

      if (!musicQueue) {
        musicQueue = [];
      }

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

      var playing = globals.get("playing");
      if (!playing) {
        playNextSong(globals, message.guild);
        globals.set("playing", true);
      }

      if (message.deletable) {
        message.delete(); // So the music channel isn't filled with youtube videos
      }
    });
  }

  if (channel.connection) {
    onChannelJoin(channel.connection); // Don't join channel that you're already in
  } else {
    channel.join().then(onChannelJoin).catch(function(err) { // Catch error
      logUtil.log("Error trying to join voiceChannel.", logUtil.STATUS_ERROR);
      console.log(err);
    });
  }
}

function thePlayCommand (message, params, globals, type) { // Is the play command
  if (params[0] != undefined) {
    var channel;
    if (message.guild.voiceConnection) {
      channel = message.guild.voiceConnection.channel;
    } else {
      //channel = discordUtil.findVoiceChannel(message.author, message.guild);
      channel = message.member.voiceChannel;
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

function endSong(message, globals) { // Used in the skip and dc commands
  console.log("test1");
  if (message.guild.voiceConnection && message.guild.voiceConnection.dispatcher) {
    console.log("test2");
    message.guild.voiceConnection.dispatcher.end(); // End the current stream
  }
}

module.exports.searchFunction = function(command) {
  return commands[command.toLowerCase()];
}

function playNextSong(globals, guild) {
    var musicQueue = globals.get("musicQueue");

    if (!musicQueue) {
      musicQueue = [];
    }

    if (musicQueue.length != 0) { // If there are songs queued
      globals.set("playing", true);

      var songToPlay = musicQueue.shift(); // Get the song
      globals.set("musicQueue", musicQueue); // Set musicQueue

      logUtil.log("Song " + songToPlay.title + " removed from queue on server " + guild.name + ".");

      if (!guild.voiceConnection) {
        musicQueue = []; // Bot isn't connected to a voiceChannel so clear the queue
      } else {
        logUtil.log("Song " + songToPlay.title + " about to run play function on " + guild.name + ".");

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
          case 4:
            var result = discordUtil.playYoutubeVideo(guild.voiceConnection, songToPlay.id, ['volume=50', 'atempo=0.7', 'asetrate=r=88200']); // Play the video both better and even better
          default:
            console.log("Song type: " + songToPlay.type);
            var result = discordUtil.playYoutubeVideo(guild.voiceConnection, songToPlay.id, undefined, ["volume=enable='between(t," + songToPlay.type.substr(1) + ",t)':volume=50"]); // Remove first letter of string to leave just the number
        }

        if (result instanceof Error) { // Check to see if an error was returned
          logUtil.log("There was an error playing a song.", logUtil.STATUS_ERROR);
          console.log(result);
        } else {
          result.once('start', function() { // Reset the timer to account for the delay it took for the stream to start
            logUtil.log("Began playing song " + songToPlay.title + " on server " + guild.name + ".");
          });

          result.once('end', function() { // Play the next song when this one ends
            logUtil.log("Stopped playing song " + songToPlay.title + " on server " + guild.name + ".");
            playNextSong(globals, guild);
          });
        }
      }
    } else {
      globals.set("playing", false);
    }

    globals.set("musicQueue", musicQueue);
}

function formatDurationHHMMSS(duration) {
  return Math.floor(duration.asHours()) + moment.utc(duration.asMilliseconds()).format(":mm:ss");
}

module.exports.close = function(globals, guild) { // Runs on close
  globals.set("musicQueue", []); // So the bot won't start playing songs weirdly
  globals.set("playing", false); // So the bot won't wait while playing nothing
}
