var fs = require('fs');
var __ = require('underscore');
var utility = require('./utility');

var output = 'data/methods.json.new';
var methods = [];

var items = JSON.parse(fs.readFileSync('cache/ge.json'));
var map = {};
__.each(items, function(item, id) {
    map[item.name] = id;
});

var cap = function(s) {
    return s.charAt(0).toUpperCase() + s.slice(1);
};

var woods = ['', 'Oak', 'Willow', 'Maple', 'Yew', 'Magic']
var bows = ['shortbow', 'shieldbow']
var unstrungBowsPerHour = 1680;
var bowsPerHour = 2520;
var bowxp = {};
__.each(['', ' (u)'], function(p) {
    var add = function(name, xp) {
        bowxp[name+p] = xp;
    };
    add('Shortbow', 5);
    add('Shortbow', 5);
    add('Shieldbow', 10);
    add('Oak shortbow', 16.5);
    add('Oak shieldbow', 25);
    add('Willow shortbow', 33.3);
    add('Willow shieldbow', 41.5);
    add('Maple shortbow', 50);
    add('Maple shieldbow', 58.3);
    add('Yew shortbow', 67.5);
    add('Yew shieldbow', 75);
    add('Magic shortbow', 83.25);
    add('Magic shieldbow', 91.5);
});

__.each(woods, function(wood, woodIndex) {
    __.each(bows, function(bow, bowIndex) {
        var reqs = {'Fletching': 15*woodIndex + 5*(bowIndex+1)};

        var nameu = cap((wood+' '+bow+' (u)').trim());
        var name = cap((wood+' '+bow).trim());

        var xphu = {'Fletching': bowxp[nameu]*unstrungBowsPerHour}
        var xph = {'Fletching': bowxp[name]*bowsPerHour}

        var suppliesu = [];
        suppliesu.push({
            'id': map[cap(((wood+' logs').trim()))],
            'name': cap(((wood+' logs').trim())),
            'rate': -unstrungBowsPerHour,
        });
        suppliesu.push({
            'id': map[nameu],
            'name': nameu,
            'rate': unstrungBowsPerHour,
        });

        var supplies = [];
        supplies.push({
            'id': map[nameu],
            'name': nameu,
            'rate': -bowsPerHour,
        });
        supplies.push({
            'id': map['Bow string'],
            'name': 'Bow string',
            'rate': -bowsPerHour,
        });
        supplies.push({
            'id': map[name],
            'name': name,
            'rate': bowsPerHour,
        });

        methods.push({
            'name': nameu,
            'requirements': reqs,
            'supplies': suppliesu,
            'xp': xphu
        });
        methods.push({
            'name': name,
            'requirements': reqs,
            'supplies': supplies,
            'xp': xph
        });
    });
});

fs.writeFileSync(output, JSON.stringify(methods, undefined, 4));
