const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
	orderId: { type: String, required: true, unique: true },
	products: [
		{
			_id: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
			status: { type: String, default: "Processing" },
			price: { type: Number, required: true },
			quantity: { type: Number, required: true },
		},
	],
	deliveryAddress: {
		name: { type: String, required: true },
		email: { type: String, required: true },
		phone: { type: String, required: true },
		address: { type: String, required: true },
		postalCode: { type: String, required: true },
		city: { type: String, required: true },
		state: { type: String, required: true },
		country: { type: String, required: true },
	},
	paymentMethod: { type: String, required: true },
	paymentId: { type: String },
	total: { type: String, required: true },
	customerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
});

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
