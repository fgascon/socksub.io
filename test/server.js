var http = require('http');
var express = require('express');
var browserify = require('browserify');
var SuckSubIO = require('..');

var app = express();

app.get('/', function(req, res, next){
	res.send('<script src="client.js"></script>');
});

app.get('/client.js', function(req, res, next){
	res.header('Content-Type', 'text/javascript');
	browserify(__dirname+'/client.js').bundle().pipe(res);
});

var socksub = SuckSubIO();

var users = {
	test: {
		id: 1,
		username: "test",
		password: "1212"
	}
};
socksub.auth(function(credentials, next){
	if(!users[credentials.username]){
		throw new Error("Invalid username");
	}
	var user = users[credentials.username];
	if(user.password !== credentials.password){
		throw new Error("Invalid password");
	}
	next(null, user);
});

socksub.expose('add', function(nb1, nb2){
	return nb1 + nb2;
});
socksub.expose('mult', function(nb1, nb2){
	return nb1 * nb2;
});

socksub.subscription('testEvent', function(req){
	
});

var num = 1;
setInterval(function(){
	socksub.dispatch('testEvent', num++);
}, 1000);

var server = http.createServer(app);
socksub.attach(server);

server.listen(3000, function(){
	var address = server.address();
	console.log("HTTP server listening on %s:%d", address.address, address.port);
});
