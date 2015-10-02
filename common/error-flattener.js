
exports.flatten = function(err){
	if(!( err instanceof Error)){
		return err;
	}
	var err2 = {
		message: err.message
	};
	for(var key in err){
		err2[key] = err[key];
	}
	return err2;
};

exports.expand = function(err){
	if(!err || !err.message){
		return err;
	}
	var err2 = new Error(err.message);
	for(var key in err){
		err2[key] = err[key];
	}
	return err2;
};
