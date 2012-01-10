/*Users*/
exports.user = function(req, res){
	console.log(req);
	/*get*/
	// if username is valid, then get user, else create fake user
	res.render('user', { title: 'User page'});
	/*post*/
	
};

exports.createUser = function(req, res){
	console.log(req);
	/*post*/
	var user = new app.User(); 
	user.name = 'test1';
	user.email = 'test@test.com';
	user.save(function (err) {
		if (!err) console.log('Success!');
	});
	res.render('user', { title: 'Create User'});
};

exports.getUser = function(req, res){
	/*get*/
	console.log(req);
	console.log('query'+req.query['stuff']);
	console.log('date'+req.query['date']);
	// if username is valid, then get user, else create fake user
	res.render('user', { title: 'User page', viewing: req.params.uid });
	/*post*/
};
