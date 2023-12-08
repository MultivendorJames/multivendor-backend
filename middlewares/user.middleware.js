// const User = require("../models/user.schema");
const jwt = require("jsonwebtoken");
const Users = require("../models/user");

const user = async (req, res, next) => {
	try {
		if (!req?.headers?.authorization || !req.headers.authorization.startsWith("Bearer ")) {
			return res.status(401).json({ error: "User doesn't have authorization set up" });
			return;
		}
		let token = req?.headers.authorization.split(" ")[1];
		// Compare auth
		let valid = await jwt.verify(token, process.env.SECRET);
		if (!valid.userId) {
			return res.status(401).json({ error: "User is not authorized" });
			return;
		}
		const user = await Users.findOne({ _id: valid.userId }, { password: 0, code: 0 });
		if (!user) {
			return res.status(401).json({ error: "User is not authorized" });
			return;
		}

		const { email, _id, role, balance } = user;
		req.user = { email, _id, role, balance };
	} catch (err) {
		res.status(403).json({ error: err.message });
		return;
	}
	next();
};

module.exports = user;
