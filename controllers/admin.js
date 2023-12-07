const User = require("../models/user");
const Product = require("../models/product");
const Order = require("../models/order");

exports.getMetrics = async (req, res) => {
	try {
		const users = await User.countDocuments();
		const products = await Product.countDocuments();
		let orders = await Order.find();
		const revenue = Math.round(orders.reduce((total, order) => total + +order.total, 0) * 100) / 100;
		orders = orders.length;
		res.status(200).json({ users, products, revenue, orders });
	} catch (e) {
		res.status(400).json({ error: e.message });
	}
};
