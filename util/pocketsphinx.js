module.exports = {};

const { exec } = require('child_process');

const token = require('../config/token.js');

module.exports.analyze = function(fileLocation, callback) { // Callback returns the translated text
  var pocketsphinxCommand = "pocketsphinx_continuous " +
  "-infile " + token.homeDirectory + "/NiceTMDiscordBot/" + fileLocation + " " +
  "-hmm " + token.homeDirectory + "/pocketsphinx/model/en-us/en-us " +
  "-lm " + token.homeDirectory + "/pocketsphinx/model/en-us/en-us.lm.bin " +
  "-dict " + token.homeDirectory + "/pocketsphinx/model/en-us/cmudict-en-us.dict " +
  "-nfft 2048 -logfn /dev/null";

  exec(pocketsphinxCommand, function(err, stdout, stderr) {
    if (err) {
      callback(null); // There was an error so don't return anything
      return;
    }

    callback(stdout);
  });
}
