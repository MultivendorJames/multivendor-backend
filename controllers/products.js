const Product = require("../models/product");
const Category = require("../models/category");
const { default: mongoose } = require("mongoose");
const User = require("../models/user");
const { getSecuredUrl } = require("../libs/cloudinary");

// All Products
exports.listProducts = async (req, res) => {
	const page = parseInt(req.query.page) || 1;
	const limit = parseInt(req.query.limit) || 10;
	const searchQuery = req.query.q || "";
	const category = req.query.category || "";
	const userId = req.query.userId || null;
	const sortBy = req.query.sortBy;

	try {
		const filter = {
			$or: [{ name: { $regex: searchQuery, $options: "i" } }, { slug: { $regex: searchQuery, $options: "i" } }, { description: { $regex: searchQuery, $options: "i" } }],
		};
		if (userId) filter.userId = userId;

		if (category) {
			const foundCategory = await Category.findOne({ slug: category });
			if (foundCategory) filter.category = foundCategory._id;
		}

		const totalRecords = await Product.countDocuments(filter);

		const totalPages = Math.ceil(totalRecords / limit);

		const products = await Product.find(filter)
			.sort(sortBy == "popular" ? { views: -1 } : { date: -1 })
			.skip((page - 1) * limit)
			.limit(limit);

		// Fetch category data for each product
		const productDataPromises = products.map(async (product) => {
			const category = product.category && mongoose.Types.ObjectId.isValid(product.category) ? await Category.findById(product.category) : null;

			const user = product.userId && mongoose.Types.ObjectId.isValid(product.userId) ? await User.findById(product.userId) : null;
			return {
				...product.toObject(),
				category: category ? category.toObject() : null,
				user: user ? user.toObject() : null,
				userId: user ? user._id : null,
			};
		});

		const data = await Promise.all(productDataPromises);

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

// Create product
exports.createProduct = async (req, res) => {
	try {
		let productData = {
			name: req.body.name,
			slug: req.body.slug,
			category: req.body.category,
			price: req.body.price,
			mrpPrice: req.body.mrpPrice,
			quantity: req.body.quantity,
			unit: req.body.unit,
			weight: req.body.weight,
			sku: req.body.sku,
			description: req.body.description,
			metaTitle: req.body.metaTitle,
			metaDescription: req.body.metaDescription,
			variations: JSON.parse(req.body.variations),
			image: "",
			userId: req.body.userId,
		};

		if (!req.file) {
			res.status(401).json("Please provide image of product");
			return;
		}

		// Store image
		let url = await getSecuredUrl(req.file);
		productData = { ...productData, image: url ? url?.url : null };

		// Check if product with name and slug already exists
		const existingProduct = await Product.findOne({
			name: req.body.name,
			slug: req.body.slug,
		});
		if (existingProduct) {
			return res.status(400).json({ error: "Name or Slug already exists" });
		}

		// Create new product
		const product = new Product(productData);
		const result = await product.save();
		res.status(201).json(productData);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};

// Read Product
exports.readProduct = async (req, res) => {
	try {
		var product = await Product.findOne({ slug: req.params.id });

		if (!product) var product = await Product.findById(req.params.id);

		if (!product) return res.status(404).json({ error: "Product not found" });

		const category = product.category && mongoose.Types.ObjectId.isValid(product.category) ? await Category.findById(product.category) : null;

		const productData = {
			...product.toObject(),
			category: category ? category.toObject() : null,
		};

		res.json(productData);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};

// Update Product
exports.updateProduct = async (req, res) => {
	try {
		const productData = {
			name: req.body.name,
			slug: req.body.slug,
			category: req.body.category,
			price: req.body.price,
			mrpPrice: req.body.mrpPrice,
			quantity: req.body.quantity,
			unit: req.body.unit,
			weight: req.body.weight,
			sku: req.body.sku,
			description: req.body.description,
			metaTitle: req.body.metaTitle,
			metaDescription: req.body.metaDescription,
			variations: JSON.parse(req.body.variations),
			image: req.file ? req.file.filename : req.body.image,
		};
		// Store image
		productData.image = await getSecuredUrl(req.file)?.url;

		// Check if product with name or slug already exist
		const existingProduct = await Product.findOne({
			name: req.body.name,
			slug: req.body.slug,
		});
		if (existingProduct && existingProduct._id != req.params.id) {
			return res.status(400).json({ error: "Name or Slug already exists" });
		}

		// Update product
		const product = await Product.findByIdAndUpdate(req.params.id, productData, {
			new: true,
		});
		res.json(product);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};

// Update Views
exports.updateViews = async (req, res) => {
	try {
		if (!req.body.views) return;

		// Update product
		const product = await Product.findByIdAndUpdate(
			req.params.id,
			{ views: req.body.views },
			{
				new: true,
			}
		);
		res.json(product);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};

// Delete product
exports.deleteProduct = async (req, res) => {
	try {
		await Product.findByIdAndDelete(req.params.id);
		res.json({ message: "Product deleted successfully" });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};
