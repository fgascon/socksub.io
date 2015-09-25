# socksub.io
SockSub + Socket.IO + Promises = great websocket interface

## On the server
```
var http = require('http');
var SockSubIO = require('socksub.io');

var socksub = SockSubIO();

socksub.auth(function(credentials, next){
	if(credentials.username === 'me' && credentials.password === 'p4sSw0rD'){
		var user = {
			id: 1
		};
		return next(null, user);
	}
	throw new Error("Invalid credentials");
});

socksub.expose('add', function(nb1, nb2){
	return nb1 + nb2;
});

socksub.subscription('/myEvent/:user', function(req){
	if(req.params.user !== req.user.id){
		throw new Error("Subscription not authorized");
	}
});

var counter = 1;
setInterval(function(){
	socksub.dispatch('/myEvent/1', counter++);
	socksub.dispatch('/myEvent/2', counter++);
	socksub.dispatch('/myEvent/3', counter++);
}, 1000);

var server = http.createServer();
socksub.attach(server);

server.listen(3000);
```

## On the client
```
var SockSubIO = require('socksub.io');

var socksub = SockSubIO();

socksub.login({
	username: 'me',
	password: 'p4sSw0rD'
}).done();

socksub.request('add', 3, 4).done(function(result){
	console.log("3 + 4 = %d", result);
});

socksub.on('/myEvent/1', function(counter){
	console.log('/myEvent/1', counter);
});
socksub.on('/myEvent/2', function(counter){
	console.log('/myEvent/2', counter);
});

socksub.subscribe('/myEvent/1').done();
socksub.subscribe('/myEvent/2').done();
```
