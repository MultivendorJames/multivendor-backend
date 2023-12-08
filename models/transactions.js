const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
	{
		paymentMethod: { type: String, required: true },
		amount: { type: Number, required: true },
		status: { type: String, default: "pending" }, // pending , completed , cancelled
		user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
	},
	{ timestamps: true }
);

const Transaction = mongoose.model("Transaction", transactionSchema);

module.exports = Transaction;
