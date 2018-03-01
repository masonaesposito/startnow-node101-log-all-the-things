const express = require('express');
const fs = require('fs');
const json2csv = require('json2csv');
const newLine = '\r\n';
const path = require('path');
const app = express();


app.use(function (req, res, next) {
    //  var agent = useragent.lookup(req.headers['user-agent']);
    var fields = ['Agent', 'Time', 'Method', 'Resource', 'Version', 'Status'];
    var date = new Date()
    var appendThis = [                  // in here we append The headers info.
        {
            'Agent':    req.get('User-Agent').replace(',', ''),
            'Time':     (new Date()).toISOString(),
            'Method':   req.method.replace(/"/g, ''),
            'Resource': req.originalUrl,
            'Version':  'HTTP/' + req.httpVersion,
            'Status':   '200',
        },
    ];
    var toCsv = {
        data: appendThis,
        fields: fields,
        hasCSVColumnTitle: false
    };
    var csv = json2csv(toCsv) + newLine;
    

   
    fs.stat('server/log.csv', function (err, stat) { // we write the information to log.csv file but if it doesnt exist it will show an error
        if (err == null) {                   // but because error is equal to null, it means that file does exist
            var csv = json2csv(toCsv) + newLine;

            fs.appendFile('server/log.csv', csv.replace(/"/g, ''), function (err) {
                if (err) throw err;
                next();
                console.log(csv)
            })
        }
        else { // if there is an error (meaning there is not such file), we create a new one

            fields = (fields + newLine);

            fs.writeFile('server/log.csv', fields, function (err, stat) {
                if (err) throw err;
                
                next();
                console.log(csv)

            });
        }

    });

});


app.get('/', (req, res) => {
    res.send('ok');
});

app.get('/log', (req, res) => {
    var appendThis = {
        'Agent': req.get('User-Agent').replace(',', ''),
        'Time': (new Date()).toISOString(),
        'Method': req.method,
        'Resource': req.originalUrl,
        'Version': 'HTTP/' + req.httpVersion,
        'Status': '200',
    };
    res.json(appendThis)
});


app.get('/logs', function (req, res) {

    fs.readFile('server/log.csv', 'utf8', function (err, data) {
        var appendThis = {
            'Agent': req.get('User-Agent').replace(',', ''),
            'Time': (new Date()).toISOString(),
            'Method': req.method,
            'Resource': req.originalUrl,
            'Version': 'HTTP/' + req.httpVersion,
            'Status': '200',
        };

        if (err) throw err;
        var toCsv = {
            data: appendThis,
            fields: fields,
            hasCSVColumnTitle: false
        };
        var csv = json2csv(toCsv) + newLine
        var lines = data.split('\n');
        var jsonData = [];

        for (var i = 1; i < lines.length; i++) {
            if (lines[i].length > 3) {
                var fields = lines[i].split(',');
                jsonData.push(                  // in here we append The headers info.
                    {
                        'Agent': fields[0],
                        'Time': fields[1],
                        'Method': fields[2],
                        'Resource': fields[3],
                        'Version': 'HTTP/' + fields[4],
                        'Status': '200',
                    }
                );
            };
        }

        res.json(jsonData);
        console.log(csv)
    });




    //     var textToServer = res.sendFile(path.normalize('fs.stat'));

    //     // res.sendFile(path.normalize(__dirname + 'fs.stat'))
    //     //  write your code to return a json object containing the log data here

});


module.exports = app;