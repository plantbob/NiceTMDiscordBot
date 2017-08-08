module.exports = {};

const discordBotsUtil = require("../util/discordBots.js");

module.exports.init = function(client) {
  client.on('ready', function() {
    updateGame(client);
  });

  client.on('guildCreate', function(guild) {
    updateGame(client);

    try {
      guild.me.nickname = "Matrix";
    } catch (exeception) {

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
        console.log(error);
      }
  });
}

module.exports.close = function(client) {

}
