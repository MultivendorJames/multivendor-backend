const express = require("express");
const router = express.Router();

const user = require("../middlewares/user.middleware");

const bookmarksController = require("../controllers/bookmarks");
router.put("/", user, bookmarksController.toggleBookmark);
router.get("/", user, bookmarksController.getBookmarks);

module.exports = router;
