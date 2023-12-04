const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
	{
		type: { type: String, required: true }, // Can be withdrawal or payment
		paymentDetails: { type: String }, // Required for only withdrawals
		paymentId: { type: String }, // Should be the orderId for payments
		amount: { type: Number, required: true },
		status: { type: String, required: true }, // pending , completed , cancelled
		user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
	},
	{ timestamps: true }
);

const Transaction = mongoose.model("Transaction", transactionSchema);

module.exports = Transaction;
