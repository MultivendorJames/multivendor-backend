const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
	orderId: { type: String, required: true, unique: true },
	products: [
		{
			_id: { type: String, required: true },
			name: { type: String, required: true },
			image: { type: String, required: true },
			price: { type: String, required: true },
			quantity: { type: String, required: true },
			unit: { type: String, required: true },
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
	sellerId: { type: String, required: true },
	customerId: { type: String, required: true },
	paymentStatus: { type: String, required: true },
	orderStatus: { type: String, default: "Processing" },
	date: { type: Date, default: Date.now },
});

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
