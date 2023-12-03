const multer = require("multer");

// This stores the image in memory to be used for other stuff
function createUpload() {
	const storage = multer.memoryStorage({});
	let upload = multer({ storage: storage });
	return upload;
}

const upload = createUpload();

module.exports = upload;
