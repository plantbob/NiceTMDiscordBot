module.exports = function(client) {
  client.on("guildMemberAdd", function(member) {
    member.addRole("Expendables");
  });
}
