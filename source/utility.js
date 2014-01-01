var fs = require('fs');
var experienceTable = JSON.parse(fs.readFileSync('data/experience_table.json'));
var _ = require('underscore');

var isNumber = function(n) {
    return typeof n == 'number' && !isNaN(n) && isFinite(n);
}

var clamp = function(min, n, max) {
    return Math.min(Math.max(min, n), max);
}

var levelToExperience = function(l) {
    if (!isNumber(l) || l < 0) {
        return 0;
    }
    l = Math.floor(l);
    l = clamp(1, l, experienceTable.length);
    return experienceTable[l-1];
}

var experienceToLevel = function(e) {
    if (!isNumber(e) || e < 0) {
        return 1;
    }
    e = Math.floor(e);
    e = clamp(1, e, 200000000);
    var index = __.sortedIndex(experienceTable, e);
    return e == experienceTable[index] ? index+1 : index;
}

var pricesToCSV = function(history) {
    var csv = 'timestamp,price\n';
    _.each(history, function(h) {
        csv += (h.timestamp.getTime()/1000) + ',' + h.price + '\n';
    });
    return csv;
}

exports.isNumber = isNumber;
exports.clamp = clamp;
exports.levelToExperience = levelToExperience;
exports.experienceToLevel = experienceToLevel;
exports.pricesToCSV = pricesToCSV;
