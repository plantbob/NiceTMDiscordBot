module.exports = {};

const request = require('request');
const token = require("../config/token.js");

module.exports.postGuildCount = function(count, callback) {
  request({
      method: "POST",
      json: true,
      headers: {
        Authorization: token.discordBotsToken
      },
      url: 'https://bots.discord.pw/api/bots/318558676241874945/stats',
      body: {"server_count": count}
    }, callback);
  request({
    method: "POST",
    json: true,
    headers: {
      Authorization: token.discordBots2Token
    },
    url: 'https://discordbots.org/api/bots/318558676241874945/stats',
    body: {"server_count": count}
  }, callback);
}
