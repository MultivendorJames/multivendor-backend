require("dotenv").config();
const nodemailer = require("nodemailer");
const smtpTransport = require("nodemailer-smtp-transport");
const fs = require("fs");
const path = require("path");

const replaceKeys = require("../utils/replaceKeys");

const sendEmail = async (to, subject, body, attachments = undefined) => {
	const transport = nodemailer.createTransport(
		smtpTransport({
			service: "Gmail",
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
		from: { address: process.env.EMAIL_ADDRESS, name: "Amazon Limited" },
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
async function sendContactMessage({ name, email, message }) {
	let template = fs.readFileSync(path.join(__dirname, "..", "templates", "contact-message.html"), "utf-8");
	let keys = [
		{ tag: "{{name}}", value: name },
		{ tag: "{{message}}", value: message },
		{ tag: "{{email}}", value: email },
	];

	let subject = "ATTENTION - New Contact Message";
	let txt = replaceKeys(template, keys);
	await sendEmail(process.env.SUPPORT_EMAIL, subject, txt);
}

async function sendSellerPayoutMessage({ name, date, amount, email }) {
	let template = fs.readFileSync(path.join(__dirname, "..", "templates", "seller-payout-notif.html"), "utf-8");
	let keys = [
		{ tag: "{{name}}", value: name },
		{ tag: "{{amount}}", value: `$${Math.round(amount * 100) / 100}` },
		{ tag: "{{date}}", value: date },
	];

	let subject = "New Payout Request Received";
	let txt = replaceKeys(template, keys);
	await sendEmail(email, subject, txt);
}

async function notifyAdminOfPayoutMessage({ name, date, amount }) {
	let template = fs.readFileSync(path.join(__dirname, "..", "templates", "admin-payout-notif.html"), "utf-8");
	let keys = [
		{ tag: "{{name}}", value: name },
		{ tag: "{{amount}}", value: `$${Math.round(amount * 100) / 100}` },
		{ tag: "{{date}}", value: date },
	];

	let subject = "ATTENTION - New Payout Request Received";
	let txt = replaceKeys(template, keys);
	await sendEmail(process.env.SUPPORT_EMAIL, subject, txt);
}
async function notifyUserOfContact({ name, email, message }) {
	let template = fs.readFileSync(path.join(__dirname, "..", "templates", "contact-received.html"), "utf-8");
	let keys = [
		{ tag: "{{name}}", value: name },
		{ tag: "{{email}}", value: email },
		{ tag: "{{message}}", value: message },
	];

	let subject = "Thank You for Contacting Us!";
	let txt = replaceKeys(template, keys);
	await sendEmail(email, subject, txt);
}

async function sendPayoutRejectionMail({ name, email, date }) {
	let template = fs.readFileSync(path.join(__dirname, "..", "templates", "payout-rejected.html"), "utf-8");
	let keys = [
		{ tag: "{{name}}", value: name },
		{ tag: "{{date}}", value: date },
		{ tag: "{{reason}}", value: "Reason not specified" },
	];

	let subject = "Your Payout Request Was Rejected";
	let txt = replaceKeys(template, keys);
	await sendEmail(email, subject, txt);
}
async function sendPayoutCompletionMail({ amount, date, email, name }) {
	let template = fs.readFileSync(path.join(__dirname, "..", "templates", "payout-success.html"), "utf-8");
	let keys = [
		{ tag: "{{amount}}", value: amount },
		{ tag: "{{date}}", value: date },
		{ tag: "{{name}}", value: name },
	];

	let subject = "ATENTION - Your Payout Request Was Successful";
	let txt = replaceKeys(template, keys);
	await sendEmail(email, subject, txt);
}

async function newsletterStatusUpdatedMail(to, code, type) {
	console.log(to, code, type);
	let subject = "Thanks for the subscription";
	let message = "This is a test message";
	await sendEmail(to, subject, message);
	console.log(`Email successfully sent to user with email ${to} and code is ${code} and user is ${type === "unsub" ? "unsubscribed" : "subscribed"}`);
}

module.exports = {
	sendResetPasswordEmail,
	notifyUserOfContact,
	sendContactMessage,
	sendSellerPayoutMessage,
	notifyAdminOfPayoutMessage,
	sendOrderPlacedMail,
	sendVerifyEmail,
	sendResetPasswordEmail,
	newsletterStatusUpdatedMail,
	sendPayoutRejectionMail,
	sendPayoutCompletionMail,
};
