const mongoose = require("mongoose");

const bookmarkSchema = new mongoose.Schema({
	user: { type: String, required: true },
	products: {
		type: [mongoose.Schema.Types.ObjectId],
	},
});

module.exports = mongoose.model("Bookmark", bookmarkSchema);
