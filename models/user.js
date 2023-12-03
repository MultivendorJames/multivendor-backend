const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
	name: { type: String, required: true },
	email: {
		type: String,
		required: true,
		validate: {
			validator: function (value) {
				const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
				return regex.test(value);
			},
			message: "Invalid email address",
		},
	},
	password: { type: String, required: true },
	role: { type: String, default: "customer" },
	date: { type: Date, default: Date.now },
	verified: { type: Boolean, default: false },
	code: { type: String },
});

// Hash password before saving to database
userSchema.pre("save", async function (next) {
	const user = this;
	if (!user.isModified("password")) return next();
	const salt = await bcrypt.genSalt(10);
	const hash = await bcrypt.hash(user.password, salt);
	user.password = hash;
	next();
});

// Compare password with hashed password in database
userSchema.methods.comparePassword = async function (password) {
	return bcrypt.compare(password, this.password);
};
userSchema.methods.storeCode = async function (code) {
	try {
		const salt = await bcrypt.genSalt(10);
		const hashedcode = await bcrypt.hash(code, salt);
		this.code = hashedcode;
	} catch (error) {
		throw error;
	}
};
userSchema.methods.compareCode = async function (code) {
	try {
		return await bcrypt.compare(code, this.code);
	} catch (error) {
		throw error;
	}
};
userSchema.methods.updatePassword = async function (password) {
	try {
		this.password = password;
	} catch (error) {
		throw error;
	}
};
userSchema.methods.resetCode = async function (password) {
	try {
		this.code = "";
	} catch (error) {
		throw error;
	}
};

const User = mongoose.model("User", userSchema);

module.exports = User;
