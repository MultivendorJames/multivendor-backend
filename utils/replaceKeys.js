function replaceKeys(text, keys) {
	if (!text) return;

	keys.forEach((e) => {
		let reg = new RegExp(e.tag, "ig");
		text = text.replace(reg, e.value);
	});
	return text;
}

module.exports = replaceKeys;
