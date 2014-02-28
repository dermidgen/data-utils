var fs = require('fs');
var express = require('express');
var app = new express();
var http = require('http').createServer(app);
var WebSocketServer = require('ws').Server;
var dnode = require('dnode');
var wss = new WebSocketServer({ server: http });
var async = require('async');
var spreadsheet = require('node_spreadsheet');

var http_port = 8020;
var dnode_port = 8021;
var baseURL = '/';

var utils = {
	test: function(input, cb) {
		console.log(input)
		process.nextTick(function(){
			cb(input);
		});
	},
	spreadsheetConvert: function(input, output, callback) {
		spreadsheet.convert(input,output,callback);
	}
};
var dserver = dnode(utils);

app.use(express.bodyParser());
// app.use(baseURL+'/', express.static('www'));
// app.use(baseURL+'/www/js', express.static('www/js'));
// app.use(baseURL+'/www/css', express.static('www/css'));
// app.use(baseURL+'/www/images', express.static('www/images'));
// app.use(baseURL+'/www/fonts', express.static('www/fonts'));
// app.use(baseURL+'/preview', express.static('tmp'));
// app.use(baseURL+'/data', express.static('data'));

app.get(baseURL+'/',function(req, res){
    res.status(200).set('Content-Type', 'text/html').send('OK');
});

wss.on('connection',function(ws) {
    // var connection = request.accept(null, request.origin);
    // clients.push(connection);

    console.log('WebSocket connection accepted');

    ws.on('message',function(message, flags){
        // console.log('WebSocket message received',message);
        
        if (!message) { 
            console.log('WebSocket empty message');
            ws.send('Error: malformed request');
            return false; 
        }

        var data = JSON.parse(message);
        if (!data) {
            console.log('WebSocket bad message');
            ws.send('Error: malformed request');
            return false; 
        }

        if (utils[data.method]) {
        	var args = [];
			if(data.args) {
				data.args.forEach(function(item){
					args.push(item);
				});
			}
        	args.push(function(event, err, body){
			    ws.send(JSON.stringify({event: event, err:err,body:body}));
			});
			// console.dir(args);
        	utils[data.method].apply(this, args);
        } else {
            console.log('Method '+data.method+' does not exist');
            ws.send('Error: malformed request');
            return false;         	
        }
    });

    ws.on('close',function(connection){
    	// clients.slice(clients.indexOf(connection),1);
        console.log('Websocket connection closed');
    });
});



dserver.listen(dnode_port);	
http.listen(http_port);

exports.utils = utils;