module.exports = {};

module.exports.init = function() {
  client.on('ready', function() {
    for (var i = 0; i < client.guilds.length; i++) {
      var guild = client.guilds[i];

      if (guild.me.nickname == "nice-tm-bot") {
        try {
          guild.me.nickname = "Matrix";
        } catch (exeception) {

        }
      }
    }
  });
}

module.exports.close = function() {

}
