// const User = require("../models/user.schema");
const jwt = require("jsonwebtoken");
const Users = require("../models/user");

const user = async (req, res, next) => {
	try {
		if (!req?.headers?.authorization || !req.headers.authorization.startsWith("Bearer ")) {
			return res.status(401).json({ error: "Please log in to perform this request" });
			return;
		}
		let token = req?.headers.authorization.split(" ")[1];
		// Compare auth
		let valid = await jwt.verify(token, process.env.SECRET);
		if (!valid.userId) {
			return res.status(401).json({ error: "Please log in to perform this task" });
			return;
		}
		const user = await Users.findOne({ _id: valid.userId }, { password: 0, code: 0 });
		if (!user) {
			return res.status(401).json({ error: "Please log in to perform this task" });
			return;
		}

		const { email, _id, role, balance, name } = user;
		req.user = { email, _id, role, balance, name };
	} catch (err) {
		res.status(403).json({ error: err.message });
		return;
	}
	next();
};

module.exports = user;
