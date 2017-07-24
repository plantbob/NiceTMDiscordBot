module.exports = {};

module.exports.init = function(client) {
  client.on('ready', function() {
    client.guilds.forEach(function(guild) {
      if (guild.me.nickname == "nice-tm-bot") {
        try {
          guild.me.nickname = "Matrix";
        } catch (exeception) {
          console.log(exeception);
        }
      }
    });
  });
}

module.exports.close = function() {

}
