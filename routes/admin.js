const express = require("express");
const user = require("../middlewares/user.middleware");
const admin = require("../middlewares/admin.middleware");

const adminController = require("../controllers/admin");

const router = express.Router();

router.get("/metrics", user, admin, adminController.getMetrics);
module.exports = router;
