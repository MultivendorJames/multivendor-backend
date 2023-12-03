const Category = require("../models/category");

// All Categories
exports.listCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create category
exports.createCategory = async (req, res) => {
  try {
    // Check if category with name and slug already exists
    const existingCategory = await Category.findOne({
      name: req.body.name,
      slug: req.body.slug,
    });
    if (existingCategory) {
      return res.status(400).json({ error: "Name or Slug already exists" });
    }

    // Create new category
    const category = new Category(req.body);
    const result = await category.save();
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Read Category
exports.readCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    res.json(category);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update Category
exports.updateCategory = async (req, res) => {
  try {
    // Check if category with name or slug already exist
    const existingCategory = await Category.findOne({
      name: req.body.name,
      slug: req.body.slug,
    });
    if (existingCategory && existingCategory._id != req.params.id) {
      return res.status(400).json({ error: "Name or Slug already exists" });
    }

    // Update category
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json(category);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete category
exports.deleteCategory = async (req, res) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    res.json({ message: "Category deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
