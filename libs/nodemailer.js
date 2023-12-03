require("dotenv").config();
const nodemailer = require("nodemailer");
const smtpTransport = require("nodemailer-smtp-transport");
const fs = require("fs");
const path = require("path");

const replaceKeys = require("../utils/replaceKeys");

const sendEmail = async (to, subject, body, attachments = undefined) => {
	const transport = nodemailer.createTransport(
		smtpTransport({
			// service: "Gmail",
			host: process.env.SMTP_HOST,
			port: 465,
			secure: true,
			auth: {
				user: process.env.EMAIL_ADDRESS,
				pass: process.env.EMAIL_PASSWORD, // you need to replace this pass.
			},
		})
	);

	const mailOptions = {
		from: process.env.EMAIL_ADDRESS,
		to,
		subject,
		html: body,
		attachments,
	};

	try {
		await transport.sendMail(mailOptions);
		return { msg: "Message succesfully sent" };
	} catch (error) {
		return { error: "Message sending failed" };
	}
};

async function sendVerifyEmail({ username, link, email }) {
	let template = fs.readFileSync(path.join(__dirname, "..", "templates", "email-verification.html"), "utf-8");
	let keys = [
		{ tag: "{{username}}", value: username },
		{ tag: "{{link}}", value: link },
	];
	let subject = "Action Required - Verify Email";
	let message = replaceKeys(template, keys);
	await sendEmail(email, subject, message);
	console.log("Email successfully sent to user with email " + email);
}
async function sendResetPasswordEmail({ username, link, email }) {
	let template = fs.readFileSync(path.join(__dirname, "..", "templates", "reset-passw-verification.html"), "utf-8");
	let keys = [
		{ tag: "{{username}}", value: username },
		{ tag: "{{link}}", value: link },
	];
	let subject = "Action Required - Reset Account Password";
	let message = replaceKeys(template, keys);
	await sendEmail(email, subject, message);
	console.log("Email successfully sent to user with email " + email);
}
async function sendOrderPlacedMail({ name, reference, email, date }) {
	let template = fs.readFileSync(path.join(__dirname, "..", "templates", "order-placed.html"), "utf-8");
	let keys = [
		{ tag: "{{name}}", value: name },
		{ tag: "{{reference}}", value: reference },
		{ tag: "{{date}}", value: date },
		{ tag: "{{email}}", value: email },
		{ tag: "{{support}}", value: process.env.SUPPORT },
	];

	let subject = "Your GCMS Notes Request Has Being Processed";
	let message = replaceKeys(template, keys);
	await sendEmail(email, subject, message);
	console.log("Email successfully sent to user with email " + email);
}

async function newsletterStatusUpdatedMail(to, code, type) {
	console.log(to, code, type);
	let subject = "Thanks for the subscription";
	let message = "This is a test message";
	await sendEmail(to, subject, message);
	console.log(`Email successfully sent to user with email ${to} and code is ${code} and user is ${type === "unsub" ? "unsubscribed" : "subscribed"}`);
}

module.exports = { sendResetPasswordEmail, sendOrderPlacedMail, sendVerifyEmail, sendResetPasswordEmail, newsletterStatusUpdatedMail };
