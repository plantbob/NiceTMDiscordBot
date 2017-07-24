module.exports = {};

module.exports.init = function(client) {
  client.on('ready', function() {
    for (var i = 0; i < client.guilds.size; i++) {
      var guild = client.guilds.get(i);

      if (guild.me.nickname == "nice-tm-bot") {
        try {
          guild.me.nickname = "Matrix";
        } catch (exeception) {
          console.log(exeception);
        }
      }
    }
  });
}

module.exports.close = function() {

}
