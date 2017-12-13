const dictMapping = require("../../util/dictmapping.js");
const textStitch = require("../../util/textstitch.js");

const fs = require('fs');
const Jimp = require('jimp');
const GIFEncoder = require('gifencoder');

// Message = message object that initiated command
// Params = The parameters of the command
// Globals = The global variables for the server that the command was initiated in
var commands = {
  ";;say" : function(message, params, globals) {
    if (!params[0]) {
      message.channel.send("Please specify a character.");
    } else if (params[1] == undefined) {
      message.channel.send("Please give a message to say.");
    } else {
      let characterHead = params.shift();
      create(params.join(" "), characterHead).then((image) => {
        image.write(message.member.user.id + ".png");
        setTimeout(() => {
            message.channel.send({files: [message.member.user.id + ".png"]});
            setTimeout(() => {
                fs.unlink(message.member.user.id + ".png");
            }, 1000);
        }, 1000);
      }).catch((err) => {
        let errString = err.toString();
        if (errString.includes(':')) { // Its an acutal error object
          message.channel.send("Error creating image.");
          console.log(err);
        } else {
          message.channel.send(errString);
        }
      });
    }

    return globals;
  },
  ";;widesay" : function(message, params, globals) {
    if (!params[0]) {
      message.channel.send("Please specify a character.");
    } else if (!params[1]) {
      message.channel.send("Please give a message to say.");
    } else {
      let characterHead = params.shift();
      create(params.join(" "), characterHead, true).then((image) => { // Wide is set to true 
        image.write(message.member.user.id + ".png");
        setTimeout(() => {
            message.channel.send({files: [message.member.user.id + ".png"]});
            setTimeout(() => {
                fs.unlink(message.member.user.id + ".png");
            }, 1000);
        }, 1000);
      }).catch((err) => {
        let errString = err.toString();
        if (errString.includes(':')) { // Its an acutal error object
          message.channel.send("Error creating image.");
          console.log(err);
        } else {
          message.channel.send(errString);
        }
      });
    }

    return globals;
  }
  ,
  ";;animsay" : function(message, params, globals) {
    if (!params[0]) {
      message.channel.send("Please specify a character.");
    } else if (!params[1]) {
      message.channel.send("Please give a message to say.");
    } else {
      let characterHead = params.shift();
      createAnim(params.join(" "), characterHead).then((image) => { // Use createAnim
        fs.writeFile(message.member.user.id + ".gif", image, function (err) {
          
        });

        setTimeout(() => {
            message.channel.send({files: [message.member.user.id + ".gif"]});
            setTimeout(() => {
                fs.unlink(message.member.user.id + ".gif");
            }, 1000);
        }, 1000);
      }).catch((err) => {
        let errString = err.toString();
        if (errString.includes(':')) { // Its an acutal error object
          message.channel.send("Error creating image.");
          console.log(err);
        } else {
          message.channel.send(errString);
        }
      });
    }

    return globals;
  }
}

module.exports.searchFunction = function(command) {
  return commands[command.toLowerCase()];
}

module.exports.close = function(globals, guild) {

}

function create(text, characterType, wide) {
  return new Promise(function(resolve, reject) {
    let easteregg = false;
    characterType = characterType.toLowerCase();
      // Start special cases 
      if (characterType == "pumpkinhead") {
        let iter = Math.floor(text.length / 5) + 1;
        text = "*mmf* ".repeat(iter).slice(0, -1);;
      }
      if (characterType.includes("gregg")) {
        if (characterType.includes('cup') || characterType.includes('cups')) {
          easteregg = true;
          characterType = "gregg";
        }
      } else if (characterType.includes("bea")) {
        if (characterType.includes('real')) {
          easteregg = true;
          characterType = "bea";
        }
      }
      // End special cases
      
      //text = text.replace(/\<\:.*?\>/g, "").toUpperCase(); // Removes text between <: and >

      if (dictMapping.init(characterType, easteregg)) {
        let letterPaths = dictMapping.getLetterPaths(text);
        
        let message = textStitch.stichText(letterPaths, dictMapping.getSoftNewLinePoints(), dictMapping.getHardNewLinePoints());
        message.then((image) => {
          textStitch.addSpeechBubble(image, dictMapping.getHeadPath(easteregg), wide).then((message) => {
            resolve(message);
          }).catch(reject);
        }).catch(reject);
      } else {
        reject("Character not identified.");
      }
  });
}

function createAnim(text, characterType) {
  return new Promise(function(resolve, reject) {
    let easteregg = false;
    characterType = characterType.toLowerCase();
      // Start special cases 
      if (characterType == "pumpkinhead") {
        let iter = Math.floor(text.length / 5) + 1;
        text = "*mmf* ".repeat(iter).slice(0, -1);;
      }
      if (characterType.includes("gregg")) {
        if (characterType.includes('cup') || characterType.includes('cups')) {
          easteregg = true;
          characterType = "gregg";
        }
      } else if (characterType.includes("bea")) {
        if (characterType.includes('real')) {
          easteregg = true;
          characterType = "bea";
        }
      }
      // End special cases
      
      //text = text.replace(/\<\:.*?\>/g, "").toUpperCase(); // Removes text between <: and >

      //console.log(letterPaths);
      if (dictMapping.init(characterType, easteregg)) {
        let letterPaths = dictMapping.getLetterPaths3Frames(text);
        console.log(letterPaths);
        let letterPromises = [];

        for (let j = 0; j < 3; j++) {
          console.log("test");
          letterPromises.push(new Promise(function(subResolve, subReject) {
            let message = textStitch.stichText(letterPaths[j], dictMapping.getSoftNewLinePoints(), dictMapping.getHardNewLinePoints());
            message.then((image) => {
              textStitch.addSpeechBubble(image, dictMapping.getHeadPath(easteregg), false, true, j).then((speechBubble) => {
                subResolve(speechBubble);
              }).catch(subReject);
            }).catch(subReject);
          }));
        }

        Promise.all(letterPromises).then(frames => { // 36393E
          let encoder = new GIFEncoder(frames[0].bitmap.width, frames[0].bitmap.height);

          encoder.start();
          encoder.setRepeat(0);
          encoder.setDelay(150);

          for (let i in frames) {
            //frames[i].write("test" + i + ".png");
            encoder.addFrame(frames[i].bitmap.data);
          }

          encoder.finish();

          resolve(encoder.out.getData());
        }).catch(reject);

      } else {
        reject("Character not identified.");
      }
  });
}