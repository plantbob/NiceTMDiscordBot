module.exports = {};

const request = require('request');
const token = require("../config/token.js");

module.exports.postGuildCount(count, callback) {
    request({
        method: "POST",
        json: true
        headers: {
          'content-type' : 'application/json',
          Authorization: token.discordBotsToken
        },
        url: 'https://bots.discord.pw/api/bots/318558676241874945/stats',
        body: JSON.stringify({"server_count": count})
      }, callback);
}
