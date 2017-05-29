module.exports = function(client) {
  client.on("guildMemberAdd", member) {
    member.addRole("Expendables");
  }
}
