module.exports = {};

const discordBotsUtil = require("../util/discordBots.js");
const discordUtil = require("../util/discordUtil.js");

const fs = require('fs');
const moment = require('moment');

var joinMessage = "```";

joinMessage += "Hello! If you need help then use ;;help\n";
joinMessage += "If you're too lazy to read the help message then here are the commands you really want: \n\n";

joinMessage += ";;earrape [url/search term] - This one plays songs at %5,000% volume\n";
joinMessage += ";;madness [time] [url/search term] - This one plays songs and changes them to %5,000 at the specified time\n";
joinMessage += "For example: \";;madness 55 smash mouth all star\" destroys your ears when the years start coming\n";
joinMessage += ";;nightcore [url/search term] - This turns anything into nightcore\n";
joinMessage += ";;hospital [url/search term] - This does both earrape and nightcore at the same time, run it only if you dare\n";
joinMessage += ";;m [subreddit] - Gets a random link from the specified subreddit\n\n";

joinMessage += "Thanks for adding me to your server, if you have ideas or feedback then go to my github: ```";
joinMessage += "https://github.com/tjpc3/NiceTMDiscordBot";

joinMessage += "If you want help with Matrix or just want to hang out come here:"
joinMessage += "https://discord.gg/QgTueQ";

//let stream;

module.exports.init = function(client) {
  client.on('ready', function() {
    // updateGame(client, false);

    setTimeout(function() {
      setClientGame(client, `Gaining Sentience...`);
    }, 5000);

    setInterval(function() {
      updateGame(client);
    }, 300000); // 5 minutes
  });

  client.on('guildCreate', function(guild) {
    discordBotsUtil.postGuildCount(client.guilds.size, function(error, response, body) {
      if (error) {
        console.log("Error: ");
        console.log(error);
      }
    });

    let messageableChannels = guild.channels.filterArray((channel) => channel.permissionsFor(guild.me).has(`SEND_MESSAGES`) );
    if (messageableChannels && messageableChannels.length > 0) {
      try {
        messageableChannels[0].send(joinMessage);
      } catch (exception) {
        console.error(exception);
      }
    }

    discordUtil.getDMChannel(guild.owner, function onDMChannelGet(dmChannel) {
      if (dmChannel) {
        try {
          dmChannel.send(joinMessage + `\n P.S. none of these commands will work in DMs, run them in a server channel.`);
        } catch (exeception) {
          console.error(exception);
        }
      } else {
        // Couldn't get DM channel
      }
    });
  });

  client.on('guildDelete', function() {
    discordBotsUtil.postGuildCount(client.guilds.size, function(error, response, body) {
      if (error) {
        console.log("Error: ");
        console.log(error);
      }
    });
  });

  function appendCurrentServers() {
    if (!client.guilds || client.guilds.size == 0) 
      return;
    
    let daysSincePublic = moment().diff(moment("20170730", "YYYYMMDD"), "days");

    fs.appendFile('serversOverTime.txt', `${daysSincePublic}\t${client.guilds.size}\r\n`, function (err) {
      if (err) throw err;
      console.log('Saved!');
    });
  }

  setInterval(appendCurrentServers, 86400000); // One day

  setTimeout(appendCurrentServers, 5000);

  // client.on('message', message => {
  //   debugger
  //   if (message.author.id === "150699865997836288" && message.content.startsWith(";;stream")) {
  //     stream = message.content.split(" ")[1]; // quick streaming functionality
  //     debugger
  //     if (stream) {
  //       client.user.setPresence({
  //         game: {
  //           name: "programming Matrix",
  //           url: stream,
  //           type: "STREAMING"
  //         }
  //       });

  //       debugger
  //     } else {
  //       setClientGame(client, `;;help - ${client.guilds.size} servers.`);
  //     }
  //   }
  // });
}


function updateGame(client) {
  // if (stream)
  //   return;

  if (((new Date).getTime() % 600000) < 300000) { // Toggle every 5 minutes
    setClientGame(client, `;;help - ${client.guilds.size} servers.`);
  } else {
    let userCount = 0;

    let guilds = Array.from(client.guilds.values());
    for (let k in guilds) {
      if (guilds[k] && guilds[k].members) {
        userCount += guilds[k].members.size;
      }
    }

    setClientGame(client, `;;help - ${userCount} users.`);
  }
}

function setClientGame(client, gameName) {
  client.user.setPresence({ activity: { name: gameName} });
}

module.exports.close = function(client) {

}

module.exports.commands = {};
