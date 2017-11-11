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
  // Begin dealing with command line input

  module.exports.commands = {
    "savedata" : {
      description : "Save server data to database",
      parameters : [],
      handler : function () {
        logUtil.log("Saving data...", logUtil.COMMAND_MESSAGE);
        saveData();
        logUtil.log("Finished saving data.", logUtil.COMMAND_MESSAGE);
      }
    }
  };
  
  // End dealing with command line input

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
              globalList[server._id] = server.getFilledNodeCache(); // This possibly doesn't set the globalList value correctly

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
        var joinMessageChannelId = tempGlobals.get("newMemberMessageChannel");
        if (joinMessageChannelId) {
          var channel = member.guild.channels.get(joinMessageChannelId);
          
          if (channel) {
            channel.send(joinMessage.replace("{{name}}", member));
          } else {
            try {
              member.guild.defaultChannel.send(joinMessage.replace("{{name}}", member));
            } catch (exception) {
      
            }
          }
        } else {
          try {
            member.guild.defaultChannel.send(joinMessage.replace("{{name}}", member));
          } catch (exception) {
    
          }
        }
      }

      
    });
  
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

function saveData() { 
  logUtil.log("Saving globals to MongoDB database...", logUtil.STATUS_NOTIFICATION);

  for (var i in globalList) {
    DiscordServer.updateWithIdFromNodeCache(i, globalList[i]);
  }
}
