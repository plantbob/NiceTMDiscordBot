module.exports = {};

module.exports.init = function(client) {
  client.on('ready', function() {
    updateGame();
  });

  client.on('guildCreate', function() {
    updateGame();
  });

  client.on('guildDelete', function() {
    updateGame();
  });
}

function updateGame() {
  client.user.setGame(`on ${client.guilds.size} servers.`);
}

module.exports.close = function(client) {

}
