const Order = require("../models/order");
const User = require("../models/user");
const Product = require("../models/product");
const Transaction = require("../models/transactions");

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

		// Create new order
		const order = new Order(req.body);
		const result = await order.save();

		// Save transaction
		await Transaction.create({ type: "payment", paymentId: result._id, amount: Math.round(+order.total * 100) / 100, status: "completed", user: req.user._id });
		res.json(result);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};

// Read Order
exports.readOrder = async (req, res) => {
	try {
		const orderId = req.params.id;
		const order = await Order.findOne({ orderId: orderId }).populate("customerId");
		if (!order) {
			res.status(404).json({ error: "The provided order was not found." });
		}

		// Get products data
		const productIds = order.products.map((product) => product._id);
		let products = await Product.find({ _id: { $in: productIds } });

		order.products = products;

		res.status(200).json(order);
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

// Update the status of a product
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
