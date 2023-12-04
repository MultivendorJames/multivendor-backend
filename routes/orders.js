const express = require("express");
const router = express.Router();
const ordersController = require("../controllers/orders");
const admin = require("../middlewares/admin.middleware");
const user = require("../middlewares/user.middleware");

router.get("/", user, ordersController.listOrders);
router.get("/all", admin, ordersController.adminFetchOrders);
router.post("/", user, ordersController.createOrder);
router.get("/:id", user, ordersController.readOrder);
router.put("/:id", user, ordersController.updateOrder);
router.put("/:orderId/status", user, ordersController.updateOrderStatus);
router.delete("/:id", user, ordersController.deleteOrder);

module.exports = router;
