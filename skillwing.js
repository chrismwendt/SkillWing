var express = require('express');
var url = require('url');
var qs = require('querystring');
var fs = require('fs');
var __ = require('underscore');
var rsNumber = require('./source/rs-number');
var ge = require('./source/ge');
var utility = require('./source/utility');

var port = 3000;

var methods = JSON.parse(fs.readFileSync('data/methods.json'));
var skills = JSON.parse(fs.readFileSync('data/skills.json'));

var app = express();
app.use(express.bodyParser());

app.get('/', function(request, response) {
    fs.readFile('views/index.template', function(error, data) {
        response.send(__.template(String(data), {'skills': skills}));
    });
});

function getCurrentFastestMethod(skill, skillset) {
    var someAvailable;
    var fastest = __.max(methods, function(method) {
        var available = __.every(method['requirements'], function(level, requirementSkillName) {
            return skillset[requirementSkillName]['current'] >= level;
        });
        if (available) {
            someAvailable = true;
            return method['xp'][skill] || 0;
        } else {
            return 0;
        }
    });
    if (someAvailable) {
        return fastest;
    } else {
        return {
            'name': 'None',
            'requirements': {},
            'supplies': [],
            'xp': {},
        };
    }
}

function stepToHTML(step) {
    return step['method']['name']+' '+
        JSON.stringify(step['from'])+'-'+JSON.stringify(step['to']);
}

app.post('/methods', function(request, response) {
    console.log('GET /methods');
    //var time_value = rsNumber.toInt(request.body.time_value);
    var skillSet = request.body['skills'];
    var experienceSet = {};
    __.each(skillSet, function(skill, skillName) {
        experienceSet[skillName] = {};
        experienceSet[skillName]['current'] = utility.levelToExperience(skill['current']);
        experienceSet[skillName]['target'] = utility.levelToExperience(skill['target']);
    });
    var steps = __.reduce(skillSet, function(memo, skillLevels, skillName) {
        if (Number(skillLevels['current']) >= Number(skillLevels['target'])) {
            return memo;
        }
        var f = getCurrentFastestMethod(skillName, skillSet);
        var step = {
            'from': {},
            'to': {},
        };
        step['from'][skillName] = skillSet[skillName]['current'];
        step['to'][skillName] = skillSet[skillName]['target'];
        step['method'] = f;
        memo.push(step);
        return memo;
    }, []);
    listItems = __.map(steps, function(step) {
        return '<li>'+stepToHTML(step)+'</li>';
    });
    innerHTML = '<ol>'+listItems.join()+'</ol>';
    response.send(innerHTML);
/*
    var time_value = rsNumber.toInt(request.body.time_value);
    var methodsDetail;
    // sort methods by effective xp/h
    methodsDetail = __.filter(methods, function(m) {
        return m.requirements.Fletching <= request.body.level;
    });
    __.each(methodsDetail, function(m, i, l) {
        //adjusted gp/xp = gp/xp - mm/h / xp/h
        l[i].gph = __.reduce(m['items'], function(memo, v, ind) {return memo + v*ge.items[ind].price;}, 0);
        l[i].gpxp = l[i].gph / m['xp']['Fletching'];
        l[i].a_gpxp = l[i].gpxp - time_value / m['xp']['Fletching'];
    });
    methodsDetail = __.sortBy(methodsDetail, function(m) {
        return m.a_gpxp;
    }).reverse();
    if (methodsDetail[0].a_gpxp > 0) {
        response.send(methodsDetail[0].name+' ('+rsNumber.fromInt(methodsDetail[0].gph)+' GP/h) is more profitable than your current time value.');
        return;
    }
    response.send('<strong>Top training methods</strong><br/>' + 
        __.map(methodsDetail.slice(0, 3), function(e) {
            return (100 * methodsDetail[0].a_gpxp / e.a_gpxp).toFixed(1) + '% ' + e.name + ': ' + 
            rsNumber.fromInt(e.xp['Fletching']) + ' XP/h, ' + 
            rsNumber.fromInt(e.gph) + ' GP/h ';
        }).join('<br/>'));
*/
});

app.use(express.static(__dirname + '/public'));

ge.start(function() {
    app.listen(port);
    console.log('Listening on port '+port);
});
