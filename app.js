var express = require('express');
var url = require('url');
var qs = require('querystring');
var fs = require('fs');
var __ = require('underscore');
var rsNumber = require('./source/rs-number');
var utility = require('./source/utility');
var db = require('./source/db');
var guide = require('./source/guide');

var port = process.env.PORT || 3000;

var app = express();

var skills = JSON.parse(fs.readFileSync('data/skills.json'));

app.get('/', function(request, response) {
    fs.readFile('views/index.template', function(error, data) {
        response.send(__.template(String(data), {'skills': skills}));
    });
});

app.get('/guide', function(request, response) {
    guide.get(request.query.skill, request.query.timeValue, function(data) {
        response.send(data);
    });
});

app.use(express.static(__dirname + '/public'));

db.init(function() {
    app.listen(port);
    console.log('Listening on port '+port);
    require('./source/populate-items')(db);
    require('./source/historian')(db);
});
