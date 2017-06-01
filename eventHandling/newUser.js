const logUtil = require("../util/logging.js");

module.exports = function(client) {
  client.on("guildMemberAdd", function(member) {
    logUtil.log(member.user.tag + " has joined a guild!", logUtil.STATUS_INFO);
    member.addRole("318560521802481665");
    member.guild.defaultChannel.send("Welcome " + member.user.toString() + " to your new robot masters for all of eternity!");
  });
}
