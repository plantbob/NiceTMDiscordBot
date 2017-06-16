const logUtil = require("../util/logging.js");

const nodecache = require("node-cache");
const fs = require("fs");

var globalList;
var searchFunctions = [];

module.exports = {};

module.exports.init = function(client) {
  try {
    var dataToRetrieve = require("../database.json")
    logUtil.log("database.json file found! Loading database...", logUtil.STATUS_INFO);

    globalList = {}; // Init empty object

    for (var i in dataToRetrieve) {
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
    searchFunctions.push(require("./command/" + file));
    logUtil.log("Loaded command list /eventHandling/command/" + file, logUtil.STATUS_INFO)
  });

  client.on('message', function(msg) {
    var words = msg.content.split(" "); // Split message into array

    var command;
    for (var i in searchFunctions) { // Search for command
      command = searchFunctions[i](words[0]);

      if (command) // Exit for loop if command is found
        break;
    }

    if (command) { // Command exists
      if (!globalList[msg.guild]) { // If global variables exist for this scene
        globalList[msg.guild] = new nodecache();
      }

      logUtil.log("User " + msg.author.username + " running command " + words.join(" "), logUtil.STATUS_INFO);
      try {
        words.shift(); // Remove first item in words array
        var newGlobals = command(msg, words, globalList[msg.guild]);
        if (newGlobals != undefined) {
          globalList[msg.guild] = newGlobals;
        }
      } catch (exception) {
        logUtil.log("Caught error running command", logUtil.STATUS_WARNING);
        console.log(exception);
      }
    } else { // Command doesn't exist

    }
  });
}

module.exports.close = function() { // This function will run on server close
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
