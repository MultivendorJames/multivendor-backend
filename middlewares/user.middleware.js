// const User = require("../models/user.schema");
const jwt = require("jsonwebtoken");
const Users = require("../models/user");

const user = async (req, res, next) => {
	try {
		if (!req?.headers?.authorization || !req.headers.authorization.startsWith("Bearer ")) {
			res.status(401).json({ error: "User doesn't have authorization set up" });
			return;
		}
		let token = req?.headers.authorization.split(" ")[1];
		console.log(token);
		// Compare auth
		let valid = await jwt.verify(token, process.env.SECRET);
		console.log(valid);

		if (!valid.userId) {
			res.status(401).json({ error: "User is not authorized" });
			return;
		}
		const user = await Users.findOne({ _id: valid.userId });
		if (!user) {
			res.status(401).json({ error: "User is not authorized" });
			return;
		}

		const { email, _id, role } = user;
		req.user = { email, _id, role };
	} catch (err) {
		res.status(403).json({ error: err.message });
		return;
	}
	next();
};

module.exports = user;
