"use strict";
var EventEmitter = require('events').EventEmitter;
var SockSub = require('socksub');
var SocketIO = require('socket.io');
var Promise = require('bluebird');
var errorFlattener = require('../common/error-flattener');
var slice = [].slice;

module.exports = function(){
	var socksub = new SockSub();
	var socksubio = new EventEmitter();
	var middlewares = [];
	var ios = [];
	
	function onConnection(socket){
		var client = socksub.createClient(socket);
		client.on('event', function(payload){
			socket.emit('event', payload.topic, payload.args);
		});
		socket.on('action', function(payload, callback){
			client.action(payload, function(err, result){
				if(err){
					callback(errorFlattener.flatten(err));
				}else{
					callback(null, result);
				}
			});
		});
	}
	
	socksubio.attach = function(){
		var io = SocketIO.apply(null, arguments);
		io.on('connection', onConnection);
		io.on('error', socksubio.emit.bind(socksubio, 'error'));
		ios.push(io);
		middlewares.forEach(function(middleware){
			io.use(middleware);
		});
	};
	
	socksubio.use = function(middleware){
		middlewares.push(middleware);
		ios.forEach(function(io){
			io.use(middleware);
		});
	};
	
	function wrapPromise(executor, callback){
		Promise.try(executor).done(function(result){
			callback(null, result);
		}, callback);
	}
	
	socksubio.expose = function(method, handle){
		socksub.expose(method, function(socket, args, callback){
			wrapPromise(function(){
				return handle.apply(socket, args);
			}, callback);
		});
	};
	
	socksubio.subscription = function(topic, handle){
		socksub.subscription(topic, function(req, callback){
			wrapPromise(function(){
				return handle.apply(null, req);
			}, callback);
		});
	};
	
	socksubio.dispatch = function(topic){
		var args = slice.call(arguments, 1);
		socksub.dispatch(topic, args);
	};
	
	return socksubio;
};
