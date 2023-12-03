function admin(req, res, next) {
	console.log(req);
	next();
}

module.exports = admin;
