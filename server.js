const Discord = require("discord.js");
const client = new Discord.Client();

client.on('ready', function() {
  console.log('Logged in as ' + client.user.username + '!');
});

client.on('message', function(msg) {
  if (msg.content === 'nice') {
    msg.react('™');
    console.log(msg.author.username + "'s nice has been trademarked.");
  }
});

token = require("./config/token.js");

client.login(token.token);
