var express = require('express');
var url = require('url');
var qs = require('querystring');
var fs = require('fs');
var __ = require('underscore');
var rsNumber = require('./source/rs-number');
var ge = require('./source/ge');
var utility = require('./source/utility');
var db = require('./source/db');

var port = process.env.PORT || 3000;

var app = express();

app.get('/', function(request, response) {
    response.sendfile('public/graph.html');
});

var history = function(name, callback) {
    db.Item.findOne({name: name}, function(error, result) {
        if (error || !result) {
            console.log('Could not get history for ' + name);
        }
        callback(utility.pricesToCSV(result.priceHistory));
    });
}

// extract 'Yew logs' from '/Yew logs.csv'
app.get('/:name([^.]*).csv', function(request, response) {
    var name = request.params.name;
    history(name, function(csv) {
        response.send(csv);
    });
});

app.use(express.static(__dirname + '/public'));

db.init(function() {
    app.listen(port);
    console.log('Listening on port '+port);
});
