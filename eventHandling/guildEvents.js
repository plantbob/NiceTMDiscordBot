module.exports = {};

const discordBotsUtil = require("../util/discordBots.js");

var joinMessage = "***";

joinMessage += "Hello! If you need help then use ;;help\n";
joinMessage += "If you're too lazy to read the help message then here are the commands you really want: \n";

joinMessage += ";;earrape [url/search term] - This one plays songs at %5,000% volume\n";
joinMessage += ";;madness [time] [url/search term] - This one plays songs and changes them to %5,000 at the specified time\n";
joinMessage += "For example: \";;madness 55 smash mouth all star\" destroys your ears when the years start coming\n";
joinMessage += ";;nightcore [url/search term] - This turns anything into nightcore\n";
joinMessage += ";;hospital [url/search term] - This does both earrape and nightcore at the same time, run it only if you dare\n";
joinMessage += ";;m [subreddit] - Gets a random link from the specified subreddit\n";

joinMessage += "Thanks for adding me to your server, if you have suggestions then go to my github: \n";
joinMessage += "https://github.com/tjpc3/NiceTMDiscordBot";

joinMessage += "***";

module.exports.init = function(client) {
  client.on('ready', function() {
    updateGame(client);
  });

  client.on('guildCreate', function(guild) {
    updateGame(client);

    if (guild.defaultChannel) {
      guild.defaultChannel.send(joinMessage);
    }
  });

  client.on('guildDelete', function() {
    updateGame(client);
  });
}

function updateGame(client) {
  client.user.setGame(`on ${client.guilds.size} servers.`);

  discordBotsUtil.postGuildCount(client.guilds.size, function(error, response, body) {
      if (error) {
        console.log("Error: ");
        console.log(error);
      }
  });
}

module.exports.close = function(client) {

}
