const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const generateCode = require("../utils/generateCode");

const User = require("../models/user");
const { sendVerifyEmail, sendResetPasswordEmail } = require("../libs/nodemailer");

// All Users
exports.listUsers = async (req, res) => {
	// try {
	//   let users = await User.find();
	//   res.json(users);
	// } catch (err) {
	//   res.status(500).json({ error: err.message });
	// }

	const page = parseInt(req.query.page) || 1;
	const limit = parseInt(req.query.limit) || 10;
	const searchQuery = req.query.q || "";

	try {
		const filter = {
			$or: [{ name: { $regex: searchQuery, $options: "i" } }, { email: { $regex: searchQuery, $options: "i" } }],
		};

		const totalRecords = await User.countDocuments(filter);

		const totalPages = Math.ceil(totalRecords / limit);

		const users = await User.find(filter)
			.skip((page - 1) * limit)
			.limit(limit);

		res.json({
			users,
			page,
			totalPages,
			totalRecords,
		});
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};

// Create User
exports.createUser = async (req, res) => {
	try {
		// Check if user with email already exists
		const existingUser = await User.findOne({ email: req.body.email });
		if (existingUser) {
			return res.status(400).json({ error: "Email already exists" });
		}

		// Create new user
		let user = new User({ ...req.body, verified: false });

		// Add verification
		const code = generateCode();
		await user.storeCode(code);
		// Save user
		user = await user.save();

		const token = jwt.sign({ email: user.email, code: user.code }, process.env.SECRET, {
			expiresIn: "2h",
		});

		const link = `${process.env.FRONTEND_URL}/user/verify?jwt=${token}`;
		// Send verification email
		await sendVerifyEmail({ username: user.name, link, email: user.email });

		res.status(200).json({ success: true });
	} catch (err) {
		console.log(err);
		res.status(500).json({ error: err.message });
	}
};

exports.verifyAccount = async (req, res) => {
	let { token } = req.body;
	try {
		let check = jwt.verify(token, process.env.SECRET);
		if (!check || !check.email || !check.code) {
			res.status(403).json({ error: "The provided  verification link is invalid" });
			return;
		}
		const user = await User.findOne({ email: check.email });
		if (!user) {
			res.status(404).json({ error: "The user doesn't exist" });
			return;
		}
		if (!user.verified) {
			// Check code
			let valid = user.code == check.code;
			if (!valid) {
				res.status(401).json({ error: "The provided code is invalid" });
				return;
			}
		}
		await User.updateOne({ email: check.email }, { $set: { verified: true }, $unset: { code: null } });
		res.status(200).json({ success: true });
		// res.json(user);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};

// Read User
exports.readUser = async (req, res) => {
	try {
		const user = await User.findById(req.params.id);
		res.json(user);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};

// Update User
exports.updateUser = async (req, res) => {
	try {
		// Check if user with email already exist
		const existingUser = await User.findOne({ email: req.body.email });
		if (existingUser && existingUser._id != req.params.id) {
			return res.status(400).json({ error: "Email already exists" });
		}

		// Update user
		const user = await User.findByIdAndUpdate(req.params.id, req.body, {
			new: true,
		});
		res.json(user);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};

exports.resetAccountPassword = async (req, res) => {
	let { email } = req.body;
	let user = await User.findOne({ email });
	if (!user) {
		res.status(404).json({ error: "There is no user with the provided email" });
		return;
	}
	// Create new code
	const code = generateCode();

	// Update user
	await user.storeCode(code);
	user = await user.save();
	const token = jwt.sign({ email: user.email, code: user.code }, process.env.SECRET, {
		expiresIn: "2h",
	});
	const link = `${process.env.FRONTEND_URL}/user/set-password?jwt=${token}`;
	// Send reset email
	await sendResetPasswordEmail({ email: user.email, link, username: user.name });

	res.status(200).json({ success: true });
};

exports.confirmPasswordReset = async (req, res) => {
	const { token, newPassword } = req.body;
	if (!token || !newPassword) {
		res.status(401).json({ error: "Please provide all required information" });
		return;
	}
	// Validate token
	let valid = jwt.verify(token, process.env.SECRET);
	if (!valid || !valid.email || !valid.code) {
		res.status(403).json({ error: "The provided  verification link is invalid" });
		return;
	}

	const user = await User.findOne({ email: valid.email });
	if (!user) {
		res.status(404).json({ error: "The user doesn't exist" });
		return;
	}

	if (!user.verified) {
		// Check code		if (!valid) {
		res.status(401).json({ error: "You cannot reset password for an unverified account. Please contact support for more info" });
		return;
	}

	// Check code against
	if (valid.code !== user.code) {
		res.status(403).json({ error: "The provided  verification link is invalid" });
		return;
	}

	// Update password
	await user.updatePassword(newPassword);
	await user.resetCode();
	await user.save();
	// await User.updateOne({ email: check.email }, { $set: { verified: true }, $unset: { code: null } });
	res.status(200).json({ success: true });
};

// Delete User
exports.deleteUser = async (req, res) => {
	try {
		await User.findByIdAndDelete(req.params.id);
		res.json({ message: "User deleted successfully" });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};

// Login User
exports.loginUser = async (req, res) => {
	const { email, password } = req.body;

	try {
		const user = await User.findOne({ email });

		if (!user) return res.status(401).json({ error: "Invalid email or password" }); // validating email
		const isMatch = await user.comparePassword(password); // validating password
		if (!isMatch) {
			return res.status(401).json({ error: "Invalid account password" });
		}

		// Check if account is verified.If no , send verification email
		if (!user.verified) {
			let code = generateCode();
			await user.storeCode(code);
			await user.save();

			// Send verification email
			const token = jwt.sign({ email: user.email, code: user.code }, process.env.SECRET, {
				expiresIn: "2h",
			});
			const link = `${process.env.FRONTEND_URL}/user/verify?jwt=${token}`;
			await sendVerifyEmail({ username: user.name, link, email: user.email });

			res.status(403).json({ error: "The account is not verified" });
			return;
		}
		// Login jwt expires in 30 days
		const token = jwt.sign({ userId: user._id }, process.env.SECRET, {
			expiresIn: "30d",
		});

		res.status(200).json({ user, token });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};

// Checking JWT
exports.checkJwt = async (req, res) => {
	const { authorization } = req.headers;
	const token = authorization && authorization.split(" ")[1];

	if (!token) {
		return res.status(401).json({ error: "Unauthorized" });
	}

	try {
		const decoded = jwt.verify(token, process.env.SECRET);
		const user = await User.findById(decoded.userId);
		res.json(user);
	} catch (error) {
		return res.status(401).json({ error: "Unauthorized" });
	}
};

// Change password
exports.changePassword = async (req, res) => {
	const { currentPassword, newPassword } = req.body;
	const id = req.params.id;

	try {
		const userFind = await User.findById(id);

		if (!userFind) return res.status(401).json({ error: "User not found" }); // validating id

		const isMatch = await userFind.comparePassword(currentPassword); // validating current password

		if (!isMatch) {
			return res.status(401).json({ error: "Invalid current password" });
		}

		const salt = await bcrypt.genSalt(10);
		const hash = await bcrypt.hash(newPassword, salt);

		// Update user
		const user = await User.findByIdAndUpdate(
			req.params.id,
			{ password: hash },
			{
				new: true,
			}
		);
		res.json(user);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};
