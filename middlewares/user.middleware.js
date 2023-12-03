const User = require("../schemas/user.schema");
const user = async (req, res, next) => {
	// Get Headers from
	try {
		const { email, _id, firstname } = response;
		req.session.user = {
			email,
			_id,
			firstname,
		};
		if (!req?.session?.user) {
			res.status(401).json({ error: "User not authorized" });
		}
	} catch (err) {
		res.status(403).json({ error: err.message });
	}
	next();
	cd;
};

module.exports = user;
