// Grand Exchange API
// http://services.runescape.com/m=rswiki/en/Grand_Exchange_APIs

var async = require('async');
var requestQueue = require('./request-queue');
var _ = require('underscore');

var getGraphURL = function(id) {
    return 'http://services.runescape.com/m=itemdb_rs/api/graph/' + id + '.json';
}

module.exports = function(db) {
    async.forever(function(callback) {
        callback = function(error) {
            if (error) {
                callback(error);
                return;
            }
            
            console.log('updated prices, waiting 24 hours');
            setTimeout(callback, 1000*3600*24); // update again in 24 hours
        }

        var stream = db.Item.find().stream();

        stream.on('data', function(item) {
            requestQueue.enqueue(getGraphURL(item.id), function(response, timestamp) {
                var history = JSON.parse(response.body).daily;

                _.each(history, function(price, timestamp) {
                    if (!_.has(item.history, timestamp)) {
                        item.history.push({
                            timestamp: timestamp,
                            price: price
                        });
                    }
                });

                item.save(function(error) {
                    if (error) {
                        console.log(error);
                    }
                });
            });
        });

        stream.on('close', callback);
    }, function(error) {
        console.log(error);
    });
}
