// Grand Exchange API
// http://services.runescape.com/m=rswiki/en/Grand_Exchange_APIs

var async = require('async');
var requestQueue = require('./request-queue')();
var _ = require('underscore');

var getGraphURL = function(id) {
    return 'http://services.runescape.com/m=itemdb_rs/api/graph/' + id + '.json';
}

var db;

var processItem = function(item, callback) {
    db.Item.findOne({id: item.id}, function(error, item) {
        requestQueue.enqueue(getGraphURL(item.id), function(response, response_timestamp) {
            var history;
            try {
                history = JSON.parse(response.body).daily;
            } catch (e) {
                console.log('Fail on ' + item.name);
                console.log('Could not parse string ' + response.body);
                console.log(e);
                callback();
                return;
            }

            item.history = []; // clear history to retard database growth
            item.history = _.map(history, function(price, timestamp) {
                return {
                    timestamp: Number(timestamp),
                    price: price
                };
            });

            item.save(function(error) {
                if (error) {
                    console.log(error);
                }
                callback();
            });
        });
    });
}

module.exports = function(_db) {
    db = _db;
    async.forever(function(callback_original) {
        callback = function(error) {
            if (error) {
                callback_original(error);
                return;
            }
            
            console.log('updated prices, waiting 24 hours');
            setTimeout(callback_original, 1000*3600*24); // update again in 24 hours
        }

        db.Item.find({}, {_id:0, id:1}).lean().exec(function(error, items) {
            async.eachSeries(items, processItem, callback);
        });
    }, function(error) {
        console.log(error);
    });
}
