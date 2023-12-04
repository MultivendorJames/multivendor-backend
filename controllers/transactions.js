const Transactions = require("../models/transactions");

exports.adminGetTransactions = async (req, res) => {
	let { status } = req.query;
	const filter = status ? { status } : {};

	const transactions = await Transactions.find(filter);
	res.status(200).json(transactions);
};
exports.getTransactions = async (req, res) => {
	let { status } = req.query;
	const filter = status ? { status, user: req.user._id } : { user: req.user._id };

	const transactions = await Transactions.find(filter);
	res.status(200).json(transactions);
};
exports.changeTransactionStatus = async (req, res) => {
	const { transactionId } = req.params;
	const { status } = req.body;
	if (!status || !["completed", "cancelled"].includes(status.toLowerCase())) {
		return res.status(401).json({ error: "Please provide a valid status for the transaction" });
	}

	const transaction = await Transactions.findOne({ _id: transactionId });
	if (!transaction) {
		return res.status(404).json({ error: "Please provide a valid transaction id" });
	}

	// Update status
	await Transactions.updateMany({ _id: transactionId }, { $set: { status: status.toLowerCase() } });
	res.status(200).json({ message: `Transaction status updated to ${status.toLowerCase()} successfully ` });
};
