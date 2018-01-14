const Discord = require("discord.js");

// Message = message object that initiated command
// Params = The parameters of the command
// Globals = The global variables for the server that the command was initiated in
var commands = {
  ";;addshortcut" : function(message, params, globals) {
    if (params[1]) {
      if (message.author.id == 150699865997836288 || message.member.hasPermission(Discord.Permissions.FLAGS.ADMINISTRATOR)) {
        let shortcuts = globals.get("shortcuts") || [];

        if (shortcuts.length >= 10) {
            console.log(shortcuts);
            message.channel.send(`You can't have more than 10 shortcuts. Remove one.`);
            return;
        }

        for (let i = 0; i < shortcuts.length; i++) {
            if (shortcuts[i].shortcut == params[0]) {
                params.shift();
                let command = params.join(" ");

                if (command.toLowerCase().indexOf("shortcut") != -1) {
                    message.channel.send(`The command can't have shortcut in it.`);
                    return;
                }

                shortcuts[i].command = params.join(command);
                globals.set("shortcuts", shortcuts);

                message.channel.send(`Shortcut for \`${command}\` has been overwritten.`);
                return;
            }
        }

        let newShortcut = params.shift();
        let command = params.join(" ");

        if (command.toLowerCase().indexOf("shortcut") != -1) {
            message.channel.send(`The command can't have shortcut in it.`);
            return;
        }

        shortcuts.push({shortcut: newShortcut, command: command});
        globals.set("shortcuts", shortcuts);

        message.channel.send(`Shortcut for \`${command}\` has been added.`);
      } else {
        message.reply("You need to be an administrator to run this command.");
      }
    } else {
      message.channel.send("Usage: ;;addshortcut [shortcut] [command] {params}");
    }
  },
  ";;removeshortcut" : function(message, params, globals) {
    if (params[0]) {
        if (message.author.id == 150699865997836288 || message.member.hasPermission(Discord.Permissions.FLAGS.ADMINISTRATOR)) {
          let shortcuts = globals.get("shortcuts") || [];
  
          for (let i = 0; i < shortcuts.length; i++) {
              if (shortcuts[i].shortcut == params[0]) {
                  
                  message.channel.send(`Shortcut for \`${shortcuts[i].command}\` has been removed.`);
                  shortcuts.splice(i, 1);
                  globals.set("shortcuts", shortcuts);
                  return;
              }
          }
  
          message.channel.send(`Shortcut \`${paramsp[0]}\` could not be found.`);
        } else {
          message.reply("You need to be an administrator to run this command.");
        }
      } else {
        message.channel.send("Usage: ;;removeshortcut [shortcut]");
      }
  },
  ";;listshortcuts" : function(message, params, globals) {
    let list = `\`\`\`Current Shortcuts: `

    let shortcuts = globals.get("shortcuts") || [];
  
    for (let i = 0; i < shortcuts.length; i++) {
        list += `\n${i + 1}. ${shortcuts[i].shortcut} : ${shortcuts[i].command}`;
    }
  
    message.channel.send(list + "```", {
        "split" : {
          "prepend" : "```",
          "append" : "```"
        }
      });
  }
}

module.exports.searchFunction = function(command) {
  return commands[command.toLowerCase()];
}

module.exports.close = function(globals, guild) {

}
