var SockSub = require('socksub');
var io = require('socket.io-client');
var Promise = require('bluebird');
var EventEmitter = require('events').EventEmitter;
var slice = [].slice;

module.exports = function(){
	var socket = io.connect.apply(io, arguments);
	var socksub = new SockSub();
	var socksubio = new EventEmitter();
	var subscriptions = {};
	var savedCredentials;
	
	socket.on('event', function(topic, args){
		socksubio.emit.apply(socksubio, [topic].concat(args));
	});
	
	socksub.on('action', function(payload, callback){
		socket.emit('action', payload, callback);
	});
	
	socket.on('reconnect', function(){
		if(!savedCredentials){
			return;
		}
		Object.keys(subscriptions).reduce(function(promise, topic){
			return promise.then(function(){
				return socksubio.subscribe(topic);
			});
		}, socksubio.login(savedCredentials)).done();
	});
	
	function sendAction(payload){
		return new Promise(function(resolve, reject){
			socksub.action(payload, function(err, result){
				if(err){
					reject(err);
				}else{
					resolve(result);
				}
			});
		});
	}
	
	socksubio.login = function(credentials){
		savedCredentials = credentials;
		return new Promise(function(resolve, reject){
			socksub.emit('action', {
				type: 'login',
				cred: credentials
			}, function(err){
				if(err){
					reject(err);
				}else{
					socksub.logged = true;
					socksub.flush();
					resolve();
				}
			});
		});
	};
	
	socksubio.request = function(method){
		var args = slice.call(arguments, 1);
		return sendAction({
			type: 'req',
			method: method,
			args: args
		});
	};
	
	socksubio.subscribe = function(topic){
		subscriptions[topic] = true;
		return sendAction({
			type: 'sub',
			topic: topic
		});
	};
	
	socksubio.unsubscribe = function(topic){
		delete subscriptions[topic];
		return sendAction({
			type: 'unsub',
			topic: topic
		});
	};
	
	return socksubio;
};
