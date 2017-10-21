const reddit = require("../../util/reddit.js");
const logUtil = require("../../util/logging.js");
const discordUtil = require("../../util/discordUtil.js");
const wikiUtil = require("../../util/wikiUtil.js");

const Discord = require("discord.js");

const wiki = require('wikijs').default;

const cheerio = require('cheerio');

var exec = require('child_process').exec;

const fs = require("fs");

var helpMessage = "```"; // The message displayed on the help message
helpMessage += "Miscallaneous Commands: ";
helpMessage += "\n1. ;;help - U wot m8?";
helpMessage += "\n2. ;;ping - Pong!";
helpMessage += "\n3. ;;oldman [whatever] - And old man tells you get off his lawn and take whatever with you.";
helpMessage += "\n4. ;;m [subreddit] - Gets a random picture from the specified subreddit. Will sort out nsfw content on sfw channels.";
helpMessage += "\n5. ;;humourme - Gets a random picture from r/I_irl";
helpMessage += "\n6. ;;meow - Gets a random picture from r/cats";
helpMessage += "\n7. ;;github - Gives a link to the bot's source.";
helpMessage += "\n8. ;;link - Gives a link so you can add this bot to your server!";
helpMessage += "\n9. ;;genisland - Not \"genis-land\". It's \"gen-island\" Generates 1000x1000 island.";
helpMessage += "\n10. ;;noice - *POP* Noice!";
helpMessage += "\n11. ;;philosophy [wikipedia search term] - This explains it http://bit.ly/2gx7U6e. To get a random page don't put in a search term";

helpMessage += "\n\nMusic Commands: ";
helpMessage += "\n12. ;;play [url/id/search term] - Adds a youtube video to the queue.";
helpMessage += "\n13. ;;playlist [url/id/search term] - Queue a playlist.";
helpMessage += "\n14. ;;earrape [url/id/search term] - Adds a youtube video to the queue but it's better.";
helpMessage += "\n15. ;;madness [time] [url/id/search term] - Adds a youtube video to the queue and makes it better after the specified time in seconds.";
helpMessage += "\n16. ;;nightcore [url/id/search term] - Adds a youtube video to the queue but it's even better.";
helpMessage += "\n17. ;;hospital [url/id/search term] - Adds a youtube video to the queue but it's better and even better.";
helpMessage += "\n18. ;;drift - GAS GAS GAS!";
helpMessage += "\n19. ;;woah - WOAH!";
helpMessage += "\n20. ;;queue - Lists the current queue.";
helpMessage += "\n21. ;;np - Shows info on the current song.";
helpMessage += "\n22. ;;skip - Skips the current song.";
helpMessage += "\n23. ;;dc - Disconnects the bot from the voice channel. Can only be run by members with the \"Manage Channel\" permission.";

helpMessage += "\n\nPrefix Commands: (Can only be run by administrators)";
helpMessage += "\n24. ;;changeprefix [prefix] - Changes the command prefix.";
helpMessage += "\n25. ;;resetprefix - Resets the prefix to two semicolons.";

helpMessage += "\n\nWelcome Message Commands: (Can only be run by administrators)";
helpMessage += "\n26. ;;setjoinmessage [message] - Sets the welcome message of the guild. Wherever you want the new member's name to be in the message, put '{{name}}'.";
helpMessage += "\n27. ;;removejoinmessage - Removes the join message.";

helpMessage += "```";

// Message = message object that initiated command
// Params = The parameters of the command
// Globals = The global variables for the server that the command was initiated in
var commands = {
  ";;help" : function(message, params, globals) {
    discordUtil.getDMChannel(message.author, function(dmChannel) {
      if (!dmChannel) {
        message.reply("Something went wrong with trying to DM you.");
      } else {
        message.reply("Look at your DMs.");

        var customPrefix = globals.get("prefix");
        if (customPrefix && customPrefix != ";;") {
          dmChannel.send(helpMessage.replace(/;;/g, customPrefix)); // Display help message with the custom prefix. /;;/g makes it replace all occurances of ;;
        } else {
          dmChannel.send(helpMessage); // Display help message normally
        }
      }
    });
  },
  ";;ping" : function(message, params, globals) {
    message.channel.send("Pong!");
  },
  ";;oldman" : function(message, params, globals) { // To test parameters
    if (!params[0]) {
      message.channel.send("What did you say? Say something afterwards for a change!");
    } else {
      message.channel.send("Get off my lawn! And take your " + params.join(" ") + " with you!");
    }
  },
  ";;humourme" : function(message, params, globals) {
    reddit.getRandomData("i_irl", discordUtil.isChannelNSFW(message.channel), function(data) {
      if (data) {
        message.channel.send(data.url);
      } else {
        message.channel.send("There was an error reaching /r/I_Irl. Blame Finland.");
      }
    });
  },
  ";;meow" : function(message, params, globals) {
    reddit.getRandomData("cats", discordUtil.isChannelNSFW(message.channel), function(data) {
      if (data) {
        message.channel.send(data.url);
      } else {
        message.channel.send("There was an error reaching /r/cats. Blame Finland.");
      }
    });
  },
  ";;m" : function(message, params, globals) {
    if (params[0]) {
      reddit.getRandomData(params[0], discordUtil.isChannelNSFW(message.channel), function(data) {
        if (data) {
          var embedData = new Discord.MessageEmbed({
            title: data.title,
            author: data.author,
            //url: data.url,
            image: data.url
          });

          message.channel.send(`\`${data.title}\`
${data.url}`);
        } else {
          message.channel.send("There was an error reaching /r/" + params[0] + " or the subreddit was nsfw and this isn't an nsfw channel you perv.");
        }
      });
    } else {
      message.channel.send("Give me the subreddit name damnit!");
    }
  },
  ";;github" : function(message, params, globals) {
    message.channel.send("https://github.com/tjpc3/NiceTMDiscordBot");
  },
  ";;genisland" : function(message, params, globals) {
    message.channel.send("One island coming up!");
    var child = exec('java -jar ./jars/genisland.jar',
      function (error, stdout, stderr) {
        if(error !== null){
          console.log("Error running Jar file: " + error);
          message.channel.send("Error: Shit hit the fan.");
          return;
        }

        message.channel.send("", {files: ["map.jpg"]});
    });
  },
  ";;test" : function(message, params, globals) {
    if (message.author.id != 150699865997836288) { // My id
      message.reply("Only the Robot Overlord is permitted to run this command.");
    } else {
      if (params[0] == "dc") {
        if (message.guild.voiceConnection != null) {
          message.guild.voiceConnection.disconnect();
        }
        return;
      }
    }
  },
  ";;count" : function(message, params, globals) {
    var count = globals.get("count");
    if (count == undefined) {
      globals.set("count", 0);
      count = 0;
    } else {
      globals.set("count", count + 1);
      count++;
    }

    message.channel.send("Current count for this server is " + count);
  },
  ";;link" : function(message, params, globals) {
    message.channel.send("Here's the link: https://discordapp.com/oauth2/authorize?client_id=318558676241874945&scope=bot&permissions=8192 \nAdd me to your server whydontcha?");
  }, 
  ";;philosophy" : function(message, params, globals) {
    if (params[0]) {
      wiki().search(params.join(" "), 1).then((data) => {
        if (data && data.results[0]) {
          onWikiData(data.results[0]);
        } else {
          message.channel.send("No results found on wikipedia.");
        }
      });
    } else {
      wiki().random(1).then((data) => {
        if (data) {
          onWikiData(data[0]);
        } else {
          message.channel.send("Error getting wikipedia page.");
        }
      });
    } 

    function onWikiData(startPage) {
      message.channel.send(`\`\`\`Starting at Wikipedia Page: ${startPage}\`\`\``);
      
      var pastPages = [];
      var count = 1;
      var messageToSend = "```";

      toPhilosophy(startPage);

      function toPhilosophy(nextPage) {
        pastPages.push(nextPage);

        wikiUtil.getWikiPageHTML(nextPage, (html) => {
          wikiUtil.getFirstLink(html, function(firstLink) {
            if (firstLink) {
              firstLink = firstLink.replace(/ /g,"_"); // Replace spaces with underscores
              
              messageToSend += `${count}. ${nextPage} -> ${firstLink}\n`;

              if (pastPages.includes(firstLink)) { // We found a loop
                messageToSend += `Loop detected. Ending iteration after ${count} steps. Philosophy not reached :(\`\`\``;
                message.channel.send(messageToSend, {"split" : {"prepend" : "```", "append" : "```"}});
              } else if (firstLink == "Philosophy") {
                messageToSend += `We reached philosophy in ${count} steps! :D\`\`\``;
                message.channel.send(messageToSend, {"split" : {"prepend" : "```", "append" : "```"}});
              } else if (count > 100) {
                messageToSend += `Stopping iteration after 100 steps because that's too big. :D\`\`\``;
                message.channel.send(messageToSend, {"split" : {"prepend" : "```", "append" : "```"}});
              } else {
                count++;
                toPhilosophy(firstLink);
              }
            } else {
              messageToSend += `No new links found. Ending iteration after ${count} steps. Philosophy not reached :(\`\`\``;
              message.channel.send(messageToSend, {"split" : {"prepend" : "```", "append" : "```"}});
            }
          });
        });
      } 
    }
  }
}

module.exports.searchFunction = function(command) {
  return commands[command.toLowerCase()];
}

module.exports.close = function(globals, guild) {

}
