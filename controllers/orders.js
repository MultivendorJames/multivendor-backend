const Order = require("../models/order");
const User = require("../models/user");
const Product = require("../models/product");

// All Orders
exports.listOrders = async (req, res) => {
	const page = parseInt(req.query.page) || 1;
	const limit = parseInt(req.query.limit) || 10;
	const searchQuery = req.query.q || "";
	const userId = req.query.userId || req.user._id;

	try {
		const filter = {};
		if (searchQuery) {
			filter.order_id = { $regex: searchQuery, $options: "i" };
		}
		if (userId) {
			filter.$or = [{ sellerId: userId }, { customerId: userId }];
		}

		const totalRecords = await Order.countDocuments(filter);

		const totalPages = Math.ceil(totalRecords / limit);

		const orders = await Order.find(filter)
			.sort({ date: -1 })
			.skip((page - 1) * limit)
			.limit(limit);

		// Fetch category data for each order
		const orderDataPromises = orders.map(async (order) => {
			const customer = order.customerId ? await User.findById(order.customerId) : null;
			const seller = order.sellerId ? await User.findById(order.sellerId) : null;
			return {
				...order.toObject(),
				customer: customer ? customer.toObject() : null,
				seller: seller ? seller.toObject() : null,
			};
		});

		const data = await Promise.all(orderDataPromises);

		res.json({
			data,
			page,
			totalPages,
			totalRecords,
		});
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};

exports.adminFetchOrders = async (req, res) => {
	const page = parseInt(req.query.page) || 1;
	const limit = parseInt(req.query.limit) || 10;
	const searchQuery = req.query.q || "";

	try {
		const filter = {};
		if (searchQuery) {
			filter.order_id = { $regex: searchQuery, $options: "i" };
		}

		const totalRecords = await Order.countDocuments(filter);

		const totalPages = Math.ceil(totalRecords / limit);

		const orders = await Order.find(filter)
			.sort({ date: -1 })
			.skip((page - 1) * limit)
			.limit(limit);

		// Fetch category data for each order
		const orderDataPromises = orders.map(async (order) => {
			const customer = order.customerId ? await User.findById(order.customerId) : null;
			const seller = order.sellerId ? await User.findById(order.sellerId) : null;
			return {
				...order.toObject(),
				customer: customer ? customer.toObject() : null,
				seller: seller ? seller.toObject() : null,
			};
		});

		const data = await Promise.all(orderDataPromises);

		res.json({
			data,
			page,
			totalPages,
			totalRecords,
		});
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};

// Create order
exports.createOrder = async (req, res) => {
	try {
		// Check if order with order id already exists
		const existingOrder = await Order.findOne({
			orderId: req.body.orderId,
		});
		if (existingOrder) {
			return res.status(400).json({ error: "Order ID already exists" });
		}

		if (req.body.paymentStatus == "paid") {
			const products = req.body.products; // Assuming req.body.products is an array of product objects

			const updatePromises = products.map((product) => {
				const { _id, quantity } = product;
				return Product.updateOne({ _id }, { $inc: { quantity: -quantity } });
			});

			Promise.all(updatePromises)
				.then(async (results) => {
					const modifiedCount = results.reduce((acc, result) => acc + result.nModified, 0);
					console.log(`${modifiedCount} products updated successfully`);
					// Create new order
					const order = new Order(req.body);
					const result = await order.save();
					res.json(result);
				})
				.catch((err) => {
					console.error(err);
					res.status(500).json({ error: "Server error" });
				});
		} else {
			// Create new order
			const order = new Order(req.body);
			const result = await order.save();
			res.json(result);
		}
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};

// Read Order
exports.readOrder = async (req, res) => {
	try {
		const orderId = req.params.id;

		var order = await Order.findOne({ orderId: orderId });

		if (!order) var order = await Order.findById(orderId);

		if (!order) return res.status(404).json({ error: "Order not found" });

		const customer = order.customerId ? await User.findById(order.customerId) : null;

		const seller = order.sellerId ? await User.findById(order.sellerId) : null;

		const data = {
			...order.toObject(),
			customer: customer ? customer.toObject() : null,
			seller: seller ? seller.toObject() : null,
		};

		res.json(data);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};

// Update Order
exports.updateOrder = async (req, res) => {
	try {
		// Check if order with order id already exist
		const existingOrder = await Order.findOne({
			orderId: req.body.orderId,
		});
		if (existingOrder && existingOrder._id != req.params.id) {
			return res.status(400).json({ error: "Order ID already exists" });
		}

		// Update order
		const order = await Order.findByIdAndUpdate(req.params.id, req.body, {
			new: true,
		});
		res.json(order);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};

exports.updateOrderStatus = async (req, res) => {
	const { status } = req.body;
	const { orderId } = req.params;
	try {
		// Check if order with order id already exist
		const existingOrder = await Order.findOne({
			_id: orderId,
		});
		if (!existingOrder) {
			res.status(404).json({ error: "Order doesn't exist" });
			return;
		}

		// Check the if this is the seller or buyer
		const seller = existingOrder.sellerId == req.user._id;
		const buyer = existingOrder.buyerId == req.user._id;

		if (!seller || !buyer) {
			return res.status(401).json({ error: "User not authorized to perform this action" });
		}
		const sellerValues = ["delivered", "shipped"];
		if (seller && !sellerValues.includes(status.toLowerCase())) {
			return res.status(401).json({ error: "Seller cannot change status to the specified value" });
		}
		if (buyer && status.toLowerCase() !== "received") {
			return res.status(401).json({ error: "Buyer can only update status to received" });
		}
		if (buyer && existingOrder.status !== "delivered") {
			return res.status(401).json({ error: "Order not marked as delivered" });
		}

		let order = await Order.updateOne({ _id: orderId }, { $set: { orderStatus: status.toLowerCase() } });

		// Update order
		res.status(200).json({ success: true });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};

// Delete order
exports.deleteOrder = async (req, res) => {
	try {
		await Order.findByIdAndDelete(req.params.id);
		res.json({ message: "Order deleted successfully" });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};
