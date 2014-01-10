var utility = require('./utility');

module.exports = function(app, db) {
    app.get('/', function(request, response) {
        response.sendfile('public/graph.html');
    });

    var history = function(name, callback) {
        db.Item.findOne({name: name}, function(error, result) {
            if (error || !result) {
                callback('Could not get history for ' + name);
                return;
            }
            callback(null, utility.pricesToCSV(result.history));
        });
    }

    // extract 'Yew logs' from '/Yew logs.csv'
    app.get('/:name([^.]*).csv', function(request, response) {
        var name = request.params.name;
        history(name, function(error, csv) {
            if (error) {
                console.log(error);
                response.send('');
                return;
            }
            response.send(csv);
        });
    });
}
