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
			filter.$or = [{ customerId: userId }];
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

		console.log(orders);

		// Fetch category data for each order
		const orderDataPromises = orders.map(async (order) => {
			const customer = order.customerId ? await User.findById(order.customerId, { email: 1, firstname: 1 }) : null;
			return {
				...order.toObject(),
				customer: customer ? customer.toObject() : null,
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

		// Create emails
		// Send email to buyer

		// Send email to seller

		// Create new order
		const order = new Order(req.body);
		const result = await order.save();

		res.json(result);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};

// Read Order
exports.readOrder = async (req, res) => {
	try {
		const orderId = req.params.id;
		let order = await Order.findOne({ orderId: orderId }).populate("customerId").populate("products");
		if (!order) {
			res.status(404).json({ error: "The provided order was not found." });
		}

		// Get products data
		const productIds = order.products.map((product) => product._id);
		let products = await Product.find({ _id: { $in: productIds } }, { name: 1, price: 1, image: 1 }).populate("userId", "email name");
		products = products.map((product) => {
			const productFromOrder = order.products.find((p) => {
				return p._id.equals(product._id);
			});
			console.log("prod", productFromOrder);
			let { userId, ...rest } = product._doc;
			return { ...rest, seller: userId, price: productFromOrder.price, status: productFromOrder.status, quantity: productFromOrder.quantity };
		});
		order = { ...order._doc, products };

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

// Update the status of a product in the order
exports.updateOrderStatus = async (req, res) => {
	const { status, productId } = req.body;
	const { orderId } = req.params;
	if (!orderId || !productId) {
		res.status(400).json({ error: "Please provide all required fields" });
	}
	try {
		// Check if order with order id already exist
		const existingOrder = await Order.findOne({
			orderId: orderId,
		});
		if (!existingOrder) {
			res.status(404).json({ error: "Order doesn't exist" });
			return;
		}

		// Check if product exists
		const product = await Product.findOne({ _id: productId });
		if (!product) {
			res.status(404).json({ error: "Product doesn't exist" });
		}

		if (product.status === "received" || product.status === status) {
			res.status(404).json({ error: "Product status has already been updated" });
		}
		if (!["shipped", "received"].includes(status)) {
			res.status(401).json({ error: "The provided status is invalid" });
		}

		let products = existingOrder.products.map((product) => (product._id.equals(productId) ? { ...product?._doc, status } : product));

		if (status === "shipped" && req.user.role !== "admin") {
			return res.status(401).json({ error: "User not authorized to perform this action" });
		}

		if (status === "received" && !req.user._id.equals(existingOrder.customerId)) {
			return res.status(401).json({ error: "User not authorized to perform this action" });
		}
		// Update product status
		await Order.updateOne({ orderId }, { $set: { products } });

		// Update seller's balance
		if (status === "received") {
			await User.updateOne({ _id: product.userId }, { $inc: { balance: Math.round(product.price * 100) / 100 } });
		}

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
