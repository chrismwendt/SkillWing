var _ = require('underscore');
var fs = require('fs');
var async = require('async');
var db;

var methods = JSON.parse(fs.readFileSync('data/methods.json'));

var groupBy = function(list, f) {
    return _.foldl(list, function(acc, value) {
        if (acc.length == 0) {
            return [[value]];
        }

        if (f(acc[acc.length - 1][0], value)) {
            acc[acc.length - 1].push(value);
            return acc;
        } else {
            acc.push([value]);
            return acc;
        }
    }, []);
};

var gph = function(method, callback) {
    async.map(method.supplies, function(supply, cb) {
        db.price(supply.id, function(price) {
            cb(null, price * supply.rate);
        });
    }, function(error, results) {
        if (error) {
            console.log(error);
        }

        callback(_.foldl(results, function(acc, value) {
            return acc + value;
        }));
    });
};

exports.get = function(skill, timeValue, callback) {
    var skillMethods = _.filter(methods, function(method) {
        return skill in method.xp;
    });

    var rawList = _.map(_.range(1,100), function(level) {
        return _.chain(skillMethods)
            .filter(function(method) {
                return method.requirements[skill] == undefined ||
                    level >= method.requirements[skill];
            })
            .max(function(method) {
                return method.xp[skill];
            })
            .value();
    });

    var groups = _.chain(groupBy(rawList, function(a, b) {
            return a.name == b.name;
        }))
        .foldl(function(acc, group) {
            acc.acc.push({
                start: acc.n,
                end: acc.n + group.length - 1,
                group: group[0]
            });
            acc.n += group.length;
            return acc;
        }, {n: 1, acc: []})
        .value()
        .acc;

    async.map(groups, function(group, cb) {
        gph(group.group, function(g) {
            cb(null, {
                levels: group.start + '-' + group.end,
                method: group.group.name,
                xp: group.group.xp[skill],
                gp: g
            });
        });
    }, function(error, results) {
        if (error) {
            console.log(error);
        }

        callback(results);
    });
};

exports.init = function(_db) {
    db = _db;
};
