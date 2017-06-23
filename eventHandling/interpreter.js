const logUtil = require("../util/logging.js");

const nodecache = require("node-cache");
const fs = require("fs");

var globalList;
var commandInterpreters = [];

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

  var commandPath = require("path").join(__dirname, "command"); // Get command folder

  fs.readdirSync(commandPath).forEach(function(file) { // Add each commandSearch function to an array
    if (file.endsWith(".js")) {
      var commandInterpreter = require("./command/" + file);
      commandInterpreters.push(commandInterpreter);
      logUtil.log("Loaded command list /eventHandling/command/" + file, logUtil.STATUS_INFO)
    }
  });

  client.on('message', function(msg) {
    if (!msg.guild) { // Message was send in DM
      return; // Don't process DM messages
    }

    var words = msg.content.split(" "); // Split message into array

    var command;
    for (var i in commandInterpreters) { // Search for command
      command = commandInterpreters[i].searchFunction(words[0]);

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

  client.on('ready', function() { // Only start the loop when the server is up and running
    setInterval(function() { // Use setInterval to make this run asynchronously
      var guildsArray = client.guilds.array();
        for (var i in guildsArray) {
          var tempGlobals = globalList[guildsArray[i].id];
          if (!tempGlobals) {
            tempGlobals = new nodecache(); // Default globals if there are none
          }

          for (var j in commandInterpreters) {
            try {
              var newGlobals = commandInterpreters[j].loop(tempGlobals, guildsArray[i]); // Run with empty globals
              if (newGlobals != undefined) // The function returned a value
              tempGlobals = newGlobals; // Set the globals
            } catch (exception) {
              logUtil.log("Caught error while running loop for guild " + guildsArray[i].name + " with interpreter " + j + ": ", logUtil.STATUS_ERROR);
              console.log(exception);
            }
          }

          globalList[guildsArray[i].id] = tempGlobals; // Set the new globals
        }
    }, 5000); // Run this function every 5 seconds
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
