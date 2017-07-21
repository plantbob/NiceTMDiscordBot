const logUtil = require("../util/logging.js");

const nodecache = require("node-cache");
const fs = require("fs");
const EventEmitter = require('events');

var globalList;
var commandInterpreters = [];
//
// class UpdateEmitter extends EventEmitter {}
//
// const updateEmitter = new UpdateEmitter();

module.exports = {};

module.exports.init = function(client) {
  try {
    var dataToRetrieve = require("../database.json")
    logUtil.log("database.json file found! Loading database...", logUtil.STATUS_INFO);

    globalList = {}; // Init empty object

    for (var i in dataToRetrieve) { // TODO : Figure out why this doesn't save music queues
      var cacheNew = new nodecache(); // Create empty cache

      for (var j in dataToRetrieve[i]) {
        cacheNew.set(j, dataToRetrieve[i][j]); // Loop through and set every value
      }

      globalList[i] = cacheNew; // Set value
    }
  } catch(exception) {
    logUtil.log("No database.json file found. Starting with empty database...", logUtil.STATUS_WARNING);
    globalList = {};
  }

  loadCommandInterpreters();

  client.on('message', function(msg) {
    if (!msg.guild) { // Message was sent in DM
      return; // Don't process DM messages
    }

    var words = msg.content.split(" "); // Split message into array

    var customPrefix = globalList[msg.guild.id].get("prefix");
    if (customPrefix && customPrefix != ";;") {
      words[0] = words[0].replace(";;", "") // Invalidate the default prefix
      words[0] = words[0].replace(customPrefix, ";;"); // Replace the custom prefix with the prefix that is recognized
    }

    var command;
    for (var i in commandInterpreters) { // Search for command
      command = commandInterpreters[i].searchFunction(words[0]); // Replace the custom prefix with the template

      if (command) // Exit for loop if command is found
        break;
    }

    if (command) { // Command exists
      if (!globalList[msg.guild.id]) { // If global variables exist for this scene
        globalList[msg.guild.id] = new nodecache();
      }

      logUtil.log("User " + msg.author.username + " running command " + words.join(" "), logUtil.STATUS_INFO);
      try {
        words.shift(); // Remove first item in words array
        var newGlobals = command(msg, words, globalList[msg.guild.id]);
        if (newGlobals != undefined) {
          globalList[msg.guild.id] = newGlobals;
        }
      } catch (exception) {
        logUtil.log("Caught error running command", logUtil.STATUS_ERROR);
        console.log(exception);
      }
    } else { // Command doesn't exist so do nothing

    }
  });

  client.on("guildMemberAdd", function(member) { // For displaying guild join messages
    var tempGlobals = globalList[member.guild.id];
    if (!tempGlobals) {
      tempGlobals = new nodecache(); // Default globals if there are none
    }

    var joinMessage = tempGlobals.get("newMemberMessage");
    if (joinMessage) {
      try {
        member.guild.defaultChannel.send(joinMessage.replace("{{name}}", member.user.username));
      } catch (exception) {

      }
    }
  });

  // Begin dealing with command line input
  process.stdin.resume();
  process.stdin.setEncoding('utf8');

  process.stdin.on('data', function (text) {
    console.log(text);
    if (text.trim() === 'reload') {
      logUtil.log("Reloading command interpreters...", logUtil.STATUS_INFO);
      loadCommandInterpreters();
      logUtil.log("Finished reloading command interpreters.", logUtil.STATUS_NOTIFICATION);
    }
  });
  // End dealing with command line input
}

function loadCommandInterpreters() {
  var commandPath = require("path").join(__dirname, "command"); // Get command folder

  fs.readdirSync(commandPath).forEach(function(file) { // Add each commandSearch function to an array
    if (file.endsWith(".js")) {
      var commandInterpreter = require("./command/" + file);
      commandInterpreters.push(commandInterpreter);
      logUtil.log("Loaded command list /eventHandling/command/" + file, logUtil.STATUS_INFO)
    }
  });
}

module.exports.close = function(client) { // This function will run on server close
  logUtil.log("Closing command interpreters...", logUtil.STATUS_INFO);

  var guildsArray = client.guilds.array();
  for (var i in guildsArray) {
    var tempGlobals = globalList[guildsArray[i].id];
    if (!tempGlobals) {
      tempGlobals = new nodecache(); // Default globals if there are none
    }
    for (var j in commandInterpreters) {
      try {
        var newGlobals = commandInterpreters[j].close(tempGlobals, guildsArray[i]); // Run with empty globals
        if (newGlobals != undefined) // The function returned a value
        tempGlobals = newGlobals; // Set the globals
      } catch (exception) {
        logUtil.log("Caught error while running close function for guild " + guildsArray[i].name + " with interpreter " + j + ": ", logUtil.STATUS_ERROR);
        console.log(exception);
      }
    }
    globalList[guildsArray[i].id] = tempGlobals; // Set the new globals
  }

  logUtil.log("Saving globals to database.json file...", logUtil.STATUS_INFO);

  var dataToSave = {};

  for (var i in globalList) { // TODO: Make code that ignores values that have TTL
    var cacheRaw = {};
    var keyList = globalList[i].keys();

    for (var j in keyList) {
      cacheRaw[keyList[j]] = globalList[i].get(keyList[j]);
    }

    dataToSave[i] = cacheRaw;
  }

  fs.writeFileSync("database.json", JSON.stringify(dataToSave)); // Save data
}
