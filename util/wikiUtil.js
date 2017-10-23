module.exports = {};

const cheerio = require('cheerio');

const fs = require("fs");

const request = require("request");

module.exports.getFirstLink = (html, callback) => {
    const $ = cheerio.load(html); 

    //var firstLink = $("div.mw-parser-output").find('a:not(.reference *, .hatnote *, #coordinates *, table *, span *, .thumbinner *)').eq(0); // Excludes references
    
    var continueIteration = true;
    
    //fs.appendFile("test.txt", html);
    
    var elems = $("div.mw-parser-output").children("ul, p"), count = elems.length;

    if (count == 0) {
        callback(null);
        return;
    }
    
    elems.each(function (index) {
        $(this).html(strip_brackets($(this).html()));

        $(this).find("a:not(span *, .extiw, .new)").each(function(index2) {
            var hasTitle = false;
            var nextUrl = '';
            
            if (this.attribs.href) {
                nextUrl = this.attribs.href;
            }

            if (this.attribs.title) {
                hasTitle = true;
            }
        
            if (!hasTitle) {
                return continueIteration;
            }

            continueIteration = false;
            callback(nextUrl.substring(6));

            return continueIteration;
        });

        if (!--count && continueIteration) {
            callback(null);
        }
            

        return continueIteration;
    });
}

module.exports.getWikiPageHTML = (page, callback) => {
 request("https://en.wikipedia.org/wiki/" + page, function (error, response, body) {
    if (error) {
        console.log('Error getting wikipedia page:', error); 
    }
    callback(body);
  });
}

function strip_brackets(element) {
    var d = 0;
    var k = 0;
    var out = '';
 
    for (var i = 0; i < element.length; i++) {
        if (d < 1) {
            if (element[i] == '>') k -= 1;
            if (element[i] == '<') k += 1;
        }

        if (k < 1) {
            if (element[i] == '(') d += 1;

            if (d > 0) out += ' ';
            else out += element[i];

            if (element[i] == ')') d -= 1;
        } else {
            out += element[i];
        }
    }

    return out;
}