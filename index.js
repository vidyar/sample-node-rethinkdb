var express = require("express"),
    r = require('rethinkdb'),
    app = express();

var connection = null;
r.connect({ host: 'localhost', port: 28015 }, function(err, conn) {
  if (err) {
    console.log('Error connecting to RethinkDB: ' + err);
  } else {
    connection = conn;
  }
  r.dbDrop('test').run(connection, function(err) {
    if(err) console.log('ERROR Dropping Database: ' + err);
  });
  r.dbCreate('test').run(connection, function(err) {
    if(err) console.log('ERROR Creating Database: ' + err);
  });
});

app.get("/", function (req, res) {
  res.send("Hey buddy!");
});

app.get("/:name", function (req, res) {
  r.table('table').filter(r.row('name').eq(req.params.name)).
    run(connection, function(err, cursor) {
      if(cursor === undefined) {
        r.db('test').tableCreate('table').run(connection, function(err, result) {
          if (err) { console.log('ERROR: ' + err); }
        });
        r.table('table').insert({
          name: req.params.name
        }).run(connection, function(err, result) {
          if (err) {
            console.log('ERROR inserting table ' + err);
            res.send(500);
          }
          res.send('Created a new thing with name ' + req.params.name);
        });
      } else {
        cursor.toArray(function(err, result) {
          if (err) console.log('Error converting data: ' + err);
          res.send(result);
        });
      }
    });
});

app.listen(3000, function () {
  console.log('Express listening on port 3000');
});
