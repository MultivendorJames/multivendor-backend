// const User = require("../models/user.schema");
const jwt = require("jsonwebtoken");
const Users = require("../models/user");

const addUser = async (req, res, next) => {
	try {
		let token = req?.headers?.authorization?.split(" ")[1];
		// Compare auth
		if (token) {
			let valid = await jwt.verify(token, process.env.SECRET);
			if (valid.userId) {
				const user = await Users.findOne({ _id: valid.userId }, { password: 0, code: 0 });
				if (user) {
					const { email, _id, role, balance, name } = user;
					req.user = { email, _id, role, balance, name };
				}
			}
		}
	} catch (err) {
		res.status(403).json({ error: err.message });
		return;
	}
	next();
};

module.exports = addUser;
