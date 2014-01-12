var db;

exports.get = function(skill, timeValue, callback) {
    callback([{skill: skill, timeValue: timeValue}]);
};

exports.init = function(_db) {
    db = _db;
};