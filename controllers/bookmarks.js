const Bookmark = require("../models/bookmarks");
const Product = require("../models/product");

exports.toggleBookmark = async (req, res) => {
	const { productId } = req.body;
	if (!productId) {
		return res.status(400).json({ error: "Please provide a product ID" });
	}
	// Check if user has a bookmark
	const bookmark = await Bookmark.findOne({ user: req.user._id });
	// Create one with the provided product id

	if (bookmark) {
		let products = bookmark.products.includes(productId) ? bookmark.products.filter((p) => !p.equals(productId)) : [...bookmark.products, productId];
		// Check and make toggle
		await Bookmark.updateOne({ _id: bookmark._id }, { $set: { products } });
	} else {
		// Create bookmark
		await Bookmark.create({ user: req.user._id, products: [productId] });
	}

	res.status(200).json({ message: "Bookmark successfully toggled" });
};

exports.getBookmarks = async (req, res) => {
	let bookmarks = await Bookmark.findOne({ user: req.user._id });
	if (!bookmarks) {
		return res.statis(200).json([]);
	}
	let promises = [];
	bookmarks?.products?.forEach((product) => promises.push(Product.findOne({ _id: product })));

	let products = await Promise.all(promises);
	res.status(200).json(products);
};
