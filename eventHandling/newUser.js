const logUtil = require("../util/logging.js");

module.exports = {};

module.exports.init = function(client) {
  client.on("guildMemberAdd", function(member) {
    logUtil.log(member.user.tag + " has joined a guild!", logUtil.STATUS_INFO);
    try {
      member.addRole("318560521802481665");
    } catch (exception) {

    }
    try {
      member.addRole("322082119319027712");
    } catch (exception) {

    }
  });
}

module.exports.close = function(client) {

}
