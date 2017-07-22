module.exports = {};

module.exports.init = function(client) {
  client.on('ready', function() {
    updateGame(client);
  });

  client.on('guildCreate', function() {
    updateGame(client);
  });

  client.on('guildDelete', function() {
    updateGame(client);
  });
}

function updateGame(cient) {
  client.user.setGame(`on ${client.guilds.size} servers.`);
}

module.exports.close = function(client) {

}
