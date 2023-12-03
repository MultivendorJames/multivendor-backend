require("dotenv").config();

const { connectDB } = require("./config/db");
const Category = require("./models/category");
const createSlug = require("./utils/createSlug");
let categories = [
	"Arts & Crafts",
	"Automotive",
	"Baby",
	"Beauty & Personal Care",
	"Books",
	"Boys Fashion",
	"Computers",
	"Deals",
	"Digital Music",
	"Electronics",
	"Girls' Fashion",
	"Health &Household",
	"Home & Kitchen",
	"Industrial & Scientific",
	"Kindle Store",
	"Luggage",
	"Men's Fashion",
	"Movies & TV",
	"Music, CDs & Vinyl",
	"Pet Supplies",
	"Prime Video",
	"Software",
	"Sports & Outdoors",
	"Tools & Home Improvement",
	"Toys & Games",
	"Video Games",
	"Women's Fashion",
];

(async function () {
	await connectDB();
	console.log(categories);

	let all = categories.map((category) => {
		return { name: category, slug: createSlug(category) };
	});

	// await Category.create(all);
	console.log("Categories created successfully");
})();
