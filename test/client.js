var SockSubIO = require('..');

var socksub = SockSubIO();

socksub.login({
	username: "test",
	password: "1212"
}).done();

socksub.request('add', 3, 4).done(function(res){
	console.log("3 + 4 = %d", res);
});

socksub.subscribe('testEvent').done(function(){
	console.log('subscribed to testEvent');
});

socksub.on('testEvent', function(num){
	console.log('testEvent', num);
});
