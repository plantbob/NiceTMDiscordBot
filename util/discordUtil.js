module.exports = {};

module.exports.findVoiceChannel = function(user, guild) { // Returns the voice channel the user is currently on, null if the user isn't on a voice channel
  var channels = message.guild.channels.array(); // Get channels in guild
  for (var k in channels) {
    if (channels[k].type == "voice") { // If channel is voice channel
      var members = channels[k].members.array() // Get members in voice channel
      for (var l in members) {
        if (members[i].user = message.author) { // If message author is in voice channel

        }
      }
    }
  }
}
