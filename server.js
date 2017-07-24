process.title = "NiceTMDiscordBot"; // This allows it to be closed easier

const youtubeUtil = require("./util/youtube.js");

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

  client.user.setUsername("Matrix");
});

var handlers = [];

var normalizedPath = path.join(__dirname, "eventHandling");

fs.readdirSync(normalizedPath).forEach(function(file) {
  if (file.endsWith(".js")) { // So it doesn't load folders
    logUtil.log("Loading /eventHandling/" + file, logUtil.STATUS_INFO);

    var handler = require("./eventHandling/" + file);
    handler.init(client);

    handlers.push(handler); // Load all files and all all their close functions to the end of the array
  }
});

rl.on('SIGINT', function() { // TODO: Delete all files in temp directory afterwards
  logUtil.log("Running close functions...", logUtil.STATUS_INFO);

  for (var i = 0; i < handlers.length; i++) {
    if(handlers[i]) {
      handlers[i].close(client);
    }
  }

  logUtil.log("Close functions done executing. Terminating program...", logUtil.STATUS_NOTIFICATION);

  process.exit(); // End process
});

logUtil.log("Logging into Discord.", logUtil.STATUS_INFO);
token = require("./config/token.js");

client.login(token.discordToken);
