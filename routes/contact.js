const express = require("express");
const { sendContactMessage } = require("../libs/nodemailer");
const contactsRouter = express.Router();

const postContactMessage = async (req, res) => {
	const { name, email, message } = req.body;
	if (!name || !email || !message) {
		res.status(401).json({ error: "Please provide all required fields" });
	}
	// Send contact message
	await sendContactMessage({ name, message, email });

	res.status(200).json({ success: true, message: "Contact message sent successfully" });
};

contactsRouter.post("/", postContactMessage);

module.exports = contactsRouter;
