const Discord = require("discord.js");

const discordUtil = require("../../util/discordUtil.js");
const logUtil = require("../../util/logging.js");

var Jimp = require("jimp");

const path = require("path");
const fs = require('fs');

var isWin = /^win/.test(process.platform);

function convertPathIfWindows(path) {
    if (isWin) return path.replace("/", "\\")
    else return path;
}

// image loading begin
var jimp74x74mask;
Jimp.read(convertPathIfWindows(path.normalize(__dirname + "/../../") + "/images/74x74mask.png"), function (err, image) {
    if (err) {
        logUtil.log("Error loading 74x74 mask image: ", logUtil.STATUS_ERROR);
        throw err;
    }

    jimp74x74mask = image;
    logUtil.log("Image 74x74mask.png loaded.", logUtil.STATUS_INFO);
});

var jimpdoitdoem;
Jimp.read(convertPathIfWindows(path.normalize(__dirname + "/../../") + "/images/5994dada1c215.png"), function (err, image) {
    if (err) {
        logUtil.log("Error loading 74x74 mask image: ", logUtil.STATUS_ERROR);
        throw err;
    }

    jimpdoitdoem = image;
    logUtil.log("Image 5994dada1c215.png loaded.", logUtil.STATUS_INFO);
});
// image loading end

// Message = message object that initiated command
// Params = The parameters of the command
// Globals = The global variables for the server that the command was initiated in
var commands = {
  ";;pfp" : function(message, params, globals) {
    if (!params[0]) {
        var avatarURL = message.author.avatarURL({size: 512, format: "png"});
        if (avatarURL) {
            message.channel.send("Here be their pfp: " + avatarURL);
        } else {
            message.channel.send("Pfp not found.");
        }
    } else {
        var avatarURL = discordUtil.getAvatarURL(params.join(' '), message.guild, 512);
        if (avatarURL) {
            message.channel.send("Here be their pfp: " + avatarURL);
        } else {
            message.channel.send("Pfp not found.");
        }
    }
  },
  ";;doittoem" : function(message, params, globals) {
    if (!params[0]) {
        var avatarURL = message.author.avatarURL({size: 128, format: "png"});
        if (avatarURL) {
            Jimp.read(avatarURL, function(err, image) {
                if (err) {
                    message.channel.send("Error processing image.");
                    console.log(err);
                } else {
                    image.resize(74, 74);
                    image.mask(jimp74x74mask, 0, 0);
                    jimpdoitdoem.composite(image, 35, 1);
                    jimpdoitdoem.write(message.member.user.id + ".png");
                    setTimeout(() => {
                        message.channel.send({files: [message.member.user.id + ".png"]});
                        setTimeout(() => {
                            fs.unlink(message.member.user.id + ".png");
                        }, 1000);
                    }, 1000);
                    
                }
            });
      } else {
        var avatarURL = discordUtil.getAvatarURL(params.join(' '), message.guild, 128);
        if (avatarURL) {
            Jimp.read(avatarURL, function(err, image) {
                if (err) {
                    message.channel.send("Error processing image.");
                    console.log(err);
                } else {
                    image.resize(74, 74);
                    image.mask(jimp74x74mask, 0, 0);
                    jimpdoitdoem.composite(image, 35, 1);
                    jimpdoitdoem.write(message.member.user.id + ".png");
                    setTimeout(() => {
                        message.channel.send({files: [message.member.user.id + ".png"]});
                        setTimeout(() => {
                            fs.unlink(message.member.user.id + ".png");
                        }, 1000);
                    }, 1000);
                }
            });
        } else {
            message.channel.send("Pfp not found.");
        }
      }
    }
  }
}

module.exports.searchFunction = function(command) {
  return commands[command.toLowerCase()];
}

module.exports.close = function(globals, guild) {

}
