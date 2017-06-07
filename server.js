const Discord = require("discord.js");
const client = new Discord.Client();

const logUtil = require("./util/logging.js");

const path = require("path");
const fs = require("fs");
const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

client.on('ready', function() {
  logUtil.log("Logged into Discord successfully as " + client.user.username + ".", logUtil.STATUS_NOTIFICATION);
});

var handlers = [];

var normalizedPath = path.join(__dirname, "eventHandling");

fs.readdirSync(normalizedPath).forEach(function(file) {
  logUtil.log("Loading ./eventHandling/" + file, logUtil.STATUS_INFO);
  var handler = require("./eventHandling/" + file);
  handler.init(client);
  handlers.push(handler); // Load all files and all all their close functions to the end of the array
});

rl.on('SIGINT', function() {
  logUtil.log("Running close functions...", logUtil.STATUS_INFO);

  for (var i = 0; i < handlers.length; i++) {
    if(handlers[i]) {
      handlers[i].close();
    }
  }

  logUtil.log("Close functions done executing. Terminating program...", logUtil.STATUS_NOTIFICATION);

  process.exit(); // End process
});

logUtil.log("Logging into Discord.", logUtil.STATUS_INFO);
token = require("./config/token.js");

client.login(token.token);
