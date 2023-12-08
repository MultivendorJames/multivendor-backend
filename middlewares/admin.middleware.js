function admin(req, res, next) {
	// Write logic here soon
	if (req?.user?.role !== "admin") {
		res.status(401).json({ error: "User not authorized to perform this action" });
	}
	next();
}

module.exports = admin;
