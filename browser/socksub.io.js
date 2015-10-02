var io = require('socket.io-client');
var Promise = require('bluebird');
var EventEmitter = require('events').EventEmitter;
var errorFlattener = require('../common/error-flattener');
var slice = [].slice;

module.exports = function(){
	var socket = io.connect.apply(io, arguments);
	var socksubio = new EventEmitter();
	var subscriptions = {};
	var savedCredentials;
	
	socket.on('event', function(topic, args){
		socksubio.emit.apply(socksubio, [topic].concat(args));
	});
	
	socket.on('reconnect', function(){
		Object.keys(subscriptions).reduce(function(promise, topic){
			return promise.then(function(){
				return socksubio.subscribe(topic);
			});
		}, Promise.resolve()).done();
	});
	
	function sendAction(payload){
		return new Promise(function(resolve, reject){
			socket.emit('action', payload, function(err, result){
				if(err){
					reject(errorFlattener.expand(err));
				}else{
					resolve(result);
				}
			});
		});
	}
	
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
