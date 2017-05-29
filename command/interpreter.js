module.exports = function(client) {
  commandSearch = require("./commands.js");

  var globalList = {}; // Stores globals for all servers

  client.on('message', function(msg) {
    var words = msg.content.split(" "); // Split message into array
    var command = commandSearch(words[0]);
    
    if (command) { // Command exists
      if (!globalList[msg.guild]) { // If global variables exist for this scene
        globalList[msg.guild] = {};
      }

      command(msg, words, globalList[msg.guild]); // Params are null for now
    } else { // Command doesn't exist

    }
  });
}
