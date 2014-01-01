var mongoose = require('mongoose');
var async = require('async');
var rsNumber = require('./rs-number');
var _ = require('underscore');

var databaseURI = process.env.MONGOLAB_URI || 'mongodb://localhost/skillwing';
var db = null;

exports.init = function(callback) {
    if (process.env.MONGOLAB_USERNAME !== undefined) {
        mongoose.connect(databaseURI, {
            user: process.env.MONGOLAB_USERNAME,
            pass: process.env.MONGOLAB_PASSWORD
        });
    } else {
        mongoose.connect(databaseURI);
    }
    db = mongoose.connection;
    db.on('error', console.error.bind(console, 'connection error:'));
    db.once('open', function() {
        exports.db = db;
        callback();
    });
}

var Item = mongoose.model('Item', {
    id: Number,
    name: String,
    history: [ {
            timestamp: Date,
            price: Number,
            volume: {
                type: Number,
                required: false
            }
        }
    ]
});

exports.Item = Item;

var createItem = function(newItem, timestamp, callback) {
    Item.create({
        id: newItem.id,
        name: newItem.name,
        history: [ {
                timestamp: timestamp,
                price: rsNumber.toInt(newItem.current.price)
            }
        ]
    }, callback);
}

var updateItem = function(item, newItem, timestamp, callback) {
    var price = rsNumber.toInt(newItem.current.price);
    if (!_.any(item.history, function(entry) {
            return entry.timestamp == timestamp;
        })) {
        item.update({
            $pushAll: {
                history: [ {
                        timestamp: timestamp,
                        price: price
                    }
                ]
            }
        }, callback);
    }
}

exports.processItem = function(item, timestamp, callback) {
    Item.findOne({
        id: item.id
    }, function(error, existingItem) {
        if (error) {
            callback(error);
            return;
        }
        console.log('Adding: ' + item.name + ' ' + item.current.price);
        if (!existingItem) {
            console.log(item.name + ' is a new item!');
            createItem(item, timestamp, callback);
        } else {
            updateItem(existingItem, item, timestamp, callback);
        }
    });
}
