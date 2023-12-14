const { sendSellerPayoutMessage, notifyAdminOfPayoutMessage, sendPayoutCompletionMail, sendPayoutRejectionMail } = require("../libs/nodemailer");
const Transactions = require("../models/transactions");
const User = require("../models/user");

exports.adminGetTransactions = async (req, res) => {
	try {
		let { status } = req.query;
		const filter = status ? { status } : {};

		const transactions = await Transactions.find(filter).populate("user", "email name").sort({ _id: -1 });
		res.status(200).json(transactions);
	} catch (e) {
		res.status(400).json({ error: e.message });
	}
};
exports.getTransactions = async (req, res) => {
	try {
		let { status } = req.query;
		const filter = status ? { status, user: req.user._id } : { user: req.user._id };

		const transactions = await Transactions.find(filter, { user: 0 });
		res.status(200).json(transactions);
	} catch (e) {
		res.status(400).json({ error: e.message });
	}
};

exports.createPayout = async (req, res) => {
	try {
		const { _id, balance, name, email } = req.user;
		const { paymentMethod } = req.body;
		if (balance === 0) {
			return res.status(400).json({ error: "User's balance must be greater than zero to request a payout." });
		}
		let date = new Date();
		// Format the date
		date = date.toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" });

		// Send an email to admin to notify them of payout
		await notifyAdminOfPayoutMessage({ name, amount: Math.round((balance * 100) / 100), date });
		// Send an email to user to tell user to tell them payout request was received
		await sendSellerPayoutMessage({ name, amount: Math.round(balance * 100) / 100, date, email });

		//  Create transaction
		await Transactions.create({ paymentMethod, amount: balance, user: _id });

		// updates user's balance
		await User.updateOne({ _id }, { balance: 0 });

		await res.status(200).json({ success: "Payout request was successful" });
	} catch (e) {
		res.status(400).json({ error: e.message });
	}
};
exports.changeTransactionStatus = async (req, res) => {
	try {
		const { transactionId } = req.params;
		const { status } = req.body;
		if (!status || !["completed", "cancelled"].includes(status.toLowerCase())) {
			return res.status(401).json({ error: "Please provide a valid status for the transaction" });
		}

		const transaction = await Transactions.findOne({ _id: transactionId }).populate("user", "email name");
		if (!transaction) {
			return res.status(404).json({ error: "Please provide a valid transaction id" });
		}

		if (transaction.status === "cancelled" || transaction.status === "completed") {
			return res.status(400).json({ error: "The payout has already been updated" });
		}
		let date = new Date();
		// Format the date
		date = date.toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" });

		// If cancelled , return seller's balance
		if (status === "cancelled") {
			// Update balance
			await User.updateOne({ _id: transaction?.user }, { $inc: { balance: transaction.amount } });
			// Send payout rejection email
			await sendPayoutRejectionMail({ date, name: transaction.user.name, email: transaction.user.email });
		} else {
			// Send payout success email
			await sendPayoutCompletionMail({ date, name: transaction.user.name, amount: `$${Math.round(transaction.amount * 100) / 100}`, email: transaction.user.email });
		}
		// Update transaction's status
		await Transactions.updateOne({ _id: transactionId }, { $set: { status: status.toLowerCase() } });
		res.status(200).json({ message: `Transaction status updated to ${status.toLowerCase()} successfully ` });
	} catch (e) {
		return res.status(400).json({ error: e.message });
	}
};
