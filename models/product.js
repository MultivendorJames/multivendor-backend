const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  slug: { type: String, required: true, unique: true },
  category: { type: String, required: false },
  price: { type: String, required: true },
  mrpPrice: { type: String, required: false },
  quantity: { type: Number, required: true },
  unit: { type: String, required: true },
  weight: { type: Number, default: 0.0 },
  sku: { type: String, required: false },
  description: { type: String, required: false },
  image: { type: String, required: false },
  variations: [
    {
      variation: { type: String, required: true },
      price: { type: String, required: true },
      quantity: { type: Number, required: true },
      image: { type: String, required: false },
    },
  ],
  metaTitle: { type: String, required: false },
  metaDescription: { type: String, required: false },
  views: { type: Number, default: 0 },
  userId: { type: String, required: true },
  date: { type: Date, default: Date.now },
});

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
