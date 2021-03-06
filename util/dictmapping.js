module.exports = {};

const fs = require('fs');
const path = require('path');

const discordUtil = require('../util/discordUtil.js');

const runes = require('runes');
const twemoji = require('twemoji');

var isWin = /^win/.test(process.platform);

function convertPathIfWindows(path) {
    if (isWin) return path.replace(/\//g, "\\");
    else return path;
}

function getGlobalPath(localpath) {
    return convertPathIfWindows(path.normalize(__dirname + "/../") + localpath);
}

let charMap =  {'A': 'A', '\'': "APOSTROPHE", '*': 'ASTERISK', 'B': 'B', 'C': 'C', ':' : 'COLON',  ',': 'COMMA', 'D': 'D',
'-': 'DASH', '$': 'DOLLAR', 'E': 'E', '8': 'EIGHT','!': 'EXCLAMATION', 'F': 'F', '5': 'FIVE', '4': 'FOUR',
'G': 'G', 'H': 'H', 'I': 'I', 'J': 'J', 'K': 'K', 'L': 'L', 'M': 'M', 'N': 'N', '9': 'NINE', 'O': 'O',
'1': 'ONE', 'P': 'P', '%' : 'PERCENT', '.' : 'PERIOD', 'Q': 'Q', '?': 'QUESTION', '"' : 'QUOTE',
'R': 'R', 'S': 'S', ';': 'SEMICOLON', '7': 'SEVEN', '6': 'SIX', 'T': 'T', '3': 'THREE', '2': 'TWO',
'U': 'U', 'V': 'V', 'W': 'W', 'X': 'X', 'Y': 'Y', 'Z': 'Z', '0': 'ZERO', ' ': 'SPACE'}

let characterTextMap = {'gregg': 'gregg', 'mae': 'standard', 'bea': 'bea', 'lori': 'lori', 'coffinwolf': 'coffinwolf', 'germ': 'germ', 'angus': 'angus',
'adina': 'standard', 'selmers': 'standard', 'jackie': 'standard', 'pumpkinhead': 'standard', 'garbo': 'standard', 'molly': 'standard',
'malloy': 'standard', 'dad': 'standard', 'mom': 'standard', 'cole': 'standard', 'deer': 'standard', 'sharkle': 'standard', 'tj': 'gregg', 'matrix': 'germ'}

let newLineChars = [' ', '!', '?', ',']

let mouthHeightDict = {'jackie': 32, 'angus': 35, 'mae': 30, 'bea': 60, 'lori': 55, 'coffinwolf': 50, 'germ': 45, 'pumpkinhead': 40,
'adina': 40, 'selmers': 25, 'garbo': 70, 'molly': 40, 'malloy': 65, 'dad': 40, 'mom': 40, 'cole': 40,
'deer': 42, 'sharkle': 80, 'gregg': 45, 'tj': 45, 'matrix':85};

let hardNewLinePoints = [];
let softNewLinePoints = [];

let headPath = getGlobalPath("assets/heads/mae.png");
let characterColor = "standard";

function isHighOrLowSurrogate(charCode) {
    return (charCode >= 56320 && charCode <= 57343) || (charCode >= 55296 && charCode <= 56191);
}

let customEmojiList = undefined;

function getLetterPath(char, charIndex, frame) { 
    if (char =='\n') { // New Line
        hardNewLinePoints.push(charIndex);
        return getGlobalPath(`assets/${characterColor}_dialogue/Dialogue_standard_1_SPACE${frame}.png`); 
    } else if (char == '░') {
        if (customEmojiList && customEmojiList.length > 0) {
            return `https://cdn.discordapp.com/emojis/${customEmojiList.shift()}.png`;
        }
    } else {
        let utfString = char.codePointAt(0).toString(16);

        if (utfString.length > 2) { // Emoji
            let hexString = twemoji.convert.toCodePoint(char);

            let filePath = getGlobalPath(`assets/72x72/${hexString}.png`);
            if (fs.existsSync(filePath)) {
                return filePath;
            } else {
                return false;
            }
            
        } else { // Regular character 
            if (newLineChars.includes(char)) {
                softNewLinePoints.push(charIndex);
            }
            
            if (char in charMap) {
                return getGlobalPath(`assets/${characterColor}_dialogue/Dialogue_standard_1_${charMap[char]}${frame}.png`);
            } else {
                return false;
            }
        }
    }
}

module.exports.getHardNewLinePoints = () => {
    return hardNewLinePoints;
}

module.exports.getSoftNewLinePoints = () => {
    return softNewLinePoints;
}

module.exports.getHeadPath = () => {
    return headPath;
}


module.exports.getMouthHeight = (headPath) => {
    for (var i in mouthHeightDict) {
        if (headPath.includes(i))
            return mouthHeightDict[i];
    }
}

module.exports.init = (character, easteregg) => {
    let emojiPath;
    if (character.codePointAt(0) > 255 && !runes(character)[1]) // Only one emoji
        emojiPath = getLetterPath(character, 0);
    
    let emoji = "";
    let processedCustomEmoji = discordUtil.processEmojis(character);
    
    if (processedCustomEmoji[1].length > 0) {
        emoji = `https://cdn.discordapp.com/emojis/${processedCustomEmoji[1][0]}.png`;
    }

    hardNewLinePoints = [];
    softNewLinePoints = [];
    
    if (emojiPath) {
        headPath = emojiPath;
        characterColor = "standard";
        
        return true;
    } else if (emoji != "") {
        headPath = emoji;
        characterColor = 'standard';

        return true;
    } else if (character in characterTextMap) {
        headPath = easteregg ? getGlobalPath(`assets/heads/${character}_easter.png`) : getGlobalPath(`assets/heads/${character}.png`);
        characterColor = characterTextMap[character];
        
        return true;
    } else {
        return false;
    }

}

module.exports.getLetterPaths = (text) => { 
    let letterPaths = [];

    let processedEmojis = discordUtil.processEmojis(text);
    text = processedEmojis[0];
    customEmojiList = processedEmojis[1];

    text = text.normalize('NFD').replace(/[\u0300-\u036f]/g, ""); // removes accents
    text = runes(text.toUpperCase());

    for (var i in text) {
        let path = getLetterPath(text[i], i, 1);
        if (path) {
            letterPaths.push(path);
        }
    }

    return letterPaths;
}

module.exports.getLetterPaths3Frames = (text) => { 
    let letterPaths = [[], [], []];

    let processedEmojis = discordUtil.processEmojis(text);
    text = processedEmojis[0];
    customEmojiList = processedEmojis[1];

    text = text.normalize('NFD').replace(/[\u0300-\u036f]/g, ""); // removes accents
    text = runes(text.toUpperCase());

    for (let j = 0; j < 3; j++) {
        hardNewLinePoints = [];
        softNewLinePoints = [];

        for (var i in text) {
            let path = getLetterPath(text[i], i, (j + i) % 3 + 1); // The "+ i" makes some animations out of phase so it looks better
            if (path) {
                letterPaths[j].push(path);
            }
        }
    }

    return letterPaths;
}