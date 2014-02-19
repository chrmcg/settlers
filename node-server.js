var fs = require('fs')
, http = require('http');

var source_files = [
    'actions.js',
    'board.js',
    'menu.js',
    'selectbox.js',
    'startbox.js',
    'state.js',
    'statusbox.js',
    'display.js'
    'dice.js',
];

var server = http.createServer(function(req, res) {
    if(req.url == '/app.xml') {
        res.writeHead(200, { 'Content-type': 'text/xml'});
        res.write('<?xml version="1.0" encoding="UTF-8" ?> <Module> <ModulePrefs title="Hangout Starter"> <Require feature="rpc" /> <Require feature="views" /> <Require feature="locked-domain" /> </ModulePrefs> <Content type="html"><![CDATA[ ');
        res.write(fs.readFileSync(__dirname + '/app_1.html'));
        source_files.forEach(function(filename) {
            res.write(fs.readFileSync(__dirname + '/' + filename));
        });
        res.write(fs.readFileSync(__dirname + '/app_2.html'));
        res.end(' ]]> </Content> </Module>');
    } else if(req.url == '/code.html') {
        res.writeHead(200, {'Content-type': 'text/html'});
        res.write(fs.readFileSync(__dirname + '/app_1.html'));
        source_files.forEach(function(filename) {
            res.write(fs.readFileSync(__dirname + '/' + filename));
        });
        res.write(fs.readFileSync(__dirname + '/app_2.html'));
    } else {
        res.writeHead(404, {'Content-type': 'text/plaintext'});
        res.end();
    }
    console.log('Request for ' + req.url);
}).listen(80, function() {
    console.log('Listening at: http://localhost');
});
