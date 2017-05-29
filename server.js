const Discord = require("discord.js");
const client = new Discord.Client();

client.on('ready', function() {
  console.log('Logged in as ' + client.user.username + '!');
});

token = require("./config/token.js");

require("./command/interpreter.js")(client);

client.login(token.token);
