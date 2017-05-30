const Discord = require("discord.js");
const client = new Discord.Client();

client.on('ready', function() {
  console.log('Logged in as ' + client.user.username + '!');
});

token = require("./config/token.js");

require("./eventHandling/interpreter.js")(client);

client.login(token.token);

//
//   var request = require('request');
//
//   request("https://www.reddit.com/r/" + "funny" + "/hot/.json", function(error, response, body) {
//     var listing = JSON.parse(body);
//     var children = listing.data.children; // Get list
//     var post = children[getRandomInt(1, 25)];
//     if (post.kind && post.kind == "t3") { // Make sure post is a link
//       var postdata = post.data;
//       console.log( postdata.url);
//     }
//   });
//
//
// function getRandomInt(min, max) {
//   min = Math.ceil(min);
//   max = Math.floor(max);
//   return Math.floor(Math.random() * (max - min)) + min;
// }
