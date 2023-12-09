const Transactions = require("../models/transactions");
const User = require("../models/user");

exports.adminGetTransactions = async (req, res) => {
	try {
		let { status } = req.query;
		const filter = status ? { status } : {};

		const transactions = await Transactions.find(filter).populate("user", "email name");
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
		const { _id, balance } = req.user;
		const { paymentMethod } = req.body;
		if (balance === 0) {
			res.status(400).json({ error: "User's balance must be greater than zero to request a payout." });
		}
		//  Create transaction
		await Transactions.create({ paymentMethod, amount: balance, user: _id });
		// Send an email to admin to notify them of payout

		// Send an email to user to tell user to tell them payout request was received

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

		const transaction = await Transactions.findOne({ _id: transactionId });
		if (!transaction) {
			return res.status(404).json({ error: "Please provide a valid transaction id" });
		}

		if (transaction.status === "cancelled" || transaction.status === "completed") {
			return res.status(400).json({ error: "The payout has already been updated" });
		}

		// Update status
		await Transactions.updateOne({ _id: transactionId }, { $set: { status: status.toLowerCase() } });
		// If cancelled , return seller's balance
		if (status === "cancelled") {
			await User.updateOne({ _id: transaction?.user }, { $inc: { balance: transaction.amount } });
		}
		res.status(200).json({ message: `Transaction status updated to ${status.toLowerCase()} successfully ` });
	} catch (e) {
		return res.status(400).json({ error: e.message });
	}
};
