const logUtil = require("../util/logging.js");
const commandSearch = require("../command/commands.js");

module.exports = function(client) {

  var globalList = {}; // Stores globals for all servers

  client.on('message', function(msg) {
    var words = msg.content.split(" "); // Split message into array
    var command = commandSearch(words[0]);

    if (command) { // Command exists
      if (!globalList[msg.guild]) { // If global variables exist for this scene
        globalList[msg.guild] = {};
      }

      logUtil.log("User " + msg.author.username + " running command " + words.join(" "), logUtil.STATUS_INFO);
      try {
        words.shift(); // Remove first item in words array
        command(msg, words, globalList[msg.guild]);
      } catch (exception) {
        logUtil.log("Caught error running command", logUtil.STATUS_WARNING);
        console.log(exception);
      }
    } else { // Command doesn't exist

    }
  });
}
