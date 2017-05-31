const Discord = require("discord.js");
const client = new Discord.Client();

const logUtil = require("./util/logging.js");

const path = require("path");
const fs = require("fs");

client.on('ready', function() {
  logUtil.log("Logged into Discord successfully as " + client.user.username + ".", logUtil.STATUS_NOTIFICATION);
});

var normalizedPath = path.join(__dirname, "eventHandling");

fs.readdirSync(normalizedPath).forEach(function(file) {
  logUtil.log("Loading ./eventHandling/" + file, logUtil.STATUS_INFO);
  require("./eventHandling/" + file)(client); // Load all files
});

logUtil.log("Logging into Discord.", logUtil.STATUS_INFO);
token = require("./config/token.js");

client.login(token.token);
