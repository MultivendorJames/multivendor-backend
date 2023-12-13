const express = require("express");
const { sendContactMessage, notifyUserOfContact } = require("../libs/nodemailer");
const contactsRouter = express.Router();

const user = require("../middlewares/user.middleware");

const postContactMessage = async (req, res) => {
	const { name, message } = req.body;
	const { email } = req.user;
	if (!name || !message) {
		res.status(401).json({ error: "Please provide all required fields" });
	}
	// Send contact message
	await sendContactMessage({ name, message, email });
	await notifyUserOfContact({ name, email, message });

	res.status(200).json({ success: true, message: "Contact message sent successfully" });
};

contactsRouter.post("/", user, postContactMessage);

module.exports = contactsRouter;
