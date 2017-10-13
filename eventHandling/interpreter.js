const logUtil = require("../util/logging.js");

const nodecache = require("node-cache");
const fs = require("fs");

var globalList;
var commandInterpreters = [];

var DiscordServer = require("./database/serverModel.js");

var mongoose = require('mongoose');
const token = require('../config/token.js');

module.exports = {};

module.exports.init = function(client) {
  mongoose.Promise = global.Promise;
  mongoose.connect(token.databaseUrl);
  var db = mongoose.connection;
  
  db.on('error', function(err) {
    logUtil.log("Error connecting to the MongoDB database:", logUtil.STATUS_ERROR);
    console.log(err);
  });
  
  db.on('open', function() {
    logUtil.log("Connected to MongoDB database successfully.", logUtil.STATUS_NOTIFICATION);
    
    globalList = {};
    logUtil.log("Loading server data from database...", logUtil.STATUS_NOTIFICATION);
    DiscordServer.find({}, (err, servers) => {
      if (err) {
        logUtil.log("Error while getting data for Discord Server", logUtil.STATUS_ERROR);
        console.log(err);
      } else {
        DiscordServer.count({}, function(err, c) {
          if (err) {
            logUtil.log("Error tring to get server collection count: ", logUtil.STATUS_ERROR);
            console.log(err);
          } else {
            if (c == 0) { // If for some reason there is no server data
              postDatabaseLoad(client);
              return;
            }

            var i = 0;
            
            servers.map(server => {
              console.log("Server Id: " + server.id + " prefix: " + server.prefix);

              var cacheNew = new nodecache();
              cacheNew.set("prefix", server.prefix);
              cacheNew.set("newMemberMessage", server.newMemberMessage);
              globalList[server.id] = cacheNew; // This possible doesn't set the globalList value correctly
              i++;
              if (i >= c) {
                logUtil.log("Server data successfully loaded!", logUtil.STATUS_INFO);
                postDatabaseLoad(client);
              }
            });
          }
        });
      }
    });
  })
}

function postDatabaseLoad(client) {
  loadCommandInterpreters();
  
    client.on('message', function(msg) {
      if (!msg.guild) { // Message was sent in DM
        return; // Don't process DM messages
      }
  
      if (!globalList[msg.guild.id]) { // If global variables don't exist for this scene
        globalList[msg.guild.id] = new nodecache(); // Make empty nodecache
      }
  
      var words = msg.content.split(" "); // Split message into array
  
      var customPrefix = globalList[msg.guild.id].get("prefix");
      console.log("Custom prefix: " + customPrefix);
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
      if (tempGlobals == undefined) {
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
      if (text.trim() === 'r') {
        logUtil.log("Reloading command interpreters...", logUtil.STATUS_INFO);
        loadCommandInterpreters();
        logUtil.log("Finished reloading command interpreters.", logUtil.STATUS_NOTIFICATION);
      } else if (text.trim() === 's') {
        logUtil.log("Saving data...", logUtil.STATUS_INFO);
        saveData();
        logUtil.log("Finished saving data.", logUtil.STATUS_NOTIFICATION);
      }
    });
    // End dealing with command line input
  
    setInterval(saveData, 3600000); // Save database every hour
}

function loadCommandInterpreters() {
  commandInterpreters = []; // Clear command interpreters

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

  saveData(); // Save data
}

// function saveData() {
//   logUtil.log("Saving globals to database.json file...", logUtil.STATUS_NOTIFICATION);

//   var dataToSave = {};

//   for (var i in globalList) { // TODO: Make code that ignores values that have TTL
//     var cacheRaw = {};
//     var keyList = globalList[i].keys();

//     keyListIterator:
//     for (var j in keyList) {
//       for (var k in dontSave) {
//         if (keyList[j] == dontSave[k]) {
//           continue keyListIterator;
//         }
//       }

//       cacheRaw[keyList[j]] = globalList[i].get(keyList[j]);
//     }

//     dataToSave[i] = cacheRaw;
//   }

//   fs.writeFileSync("database.json", JSON.stringify(dataToSave)); // Save data
// }

function saveData() { 
  logUtil.log("Saving globals to MongoDB database...", logUtil.STATUS_NOTIFICATION);

  for (var i in globalList) {
    DiscordServer.findOne({id: i}, function(err, server) {
      if (err) {
        logUtil.log("Error finding server with id " + i + ":");
        console.log(err);

        server = new DiscordServer({
          id: i,
          prefix: globalList[i].get("prefix"),
          newMemberMessage: globalList[i].get("newMemberMessage")
        });
      } else if (!server) {
        server = new DiscordServer({
          id: i,
          prefix: globalList[i].get("prefix"),
          newMemberMessage: globalList[i].get("newMemberMessage")
        });
      } else {
        server.prefix = globalList[i].get("prefix");
        server.newMemberMessage = globalList[i].get("newMemberMessage");
      }
  
      server.save((err) => {
        if (err) {
          logUtil.log("Error saving server data to database: ". logUtil.STATUS_ERROR);
          console.log(err);
        }
      });
    });
  }
}
