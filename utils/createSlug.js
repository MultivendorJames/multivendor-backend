function createSlug(title) {
	const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	let result = "";
	for (let i = 0; i < 8; i++) {
		const randomIndex = Math.floor(Math.random() * charset.length);
		result += charset.charAt(randomIndex);
	}
	const slug = title.toLowerCase().trim().replace(/\s+/g, "-");
	// Remove special characters
	return slug.replace(/[^\w-]/g, "").replace(/\-+/g, "-") + "-" + result;
}

module.exports = createSlug;
