var express = require('express');
var url = require('url');
var qs = require('querystring');
var fs = require('fs');
var __ = require('underscore');
var rsNumber = require('./source/rs-number');
var ge = require('./source/ge');
var utility = require('./source/utility');

var port = process.env.PORT || 3000;

var app = express();

app.get('/', function(request, response) {
    response.sendfile('public/graph.html');
});

app.get('/Yew logs.csv', function(request, response) {
    response.sendfile('public/Yew logs.csv');
});

app.use(express.static(__dirname + '/public'));

ge.start(function() {
    app.listen(port);
    console.log('Listening on port '+port);
});
