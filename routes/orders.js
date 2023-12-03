const express = require("express");
const router = express.Router();
const ordersController = require("../controllers/orders");
const admin = require("../middlewares/admin.middleware");

router.get("/", ordersController.listOrders);
router.get("/all", admin, ordersController.adminFetchOrders);
router.post("/", ordersController.createOrder);
router.get("/:id", ordersController.readOrder);
router.put("/:id", ordersController.updateOrder);
router.put("/:orderId/status", ordersController.updateOrderStatus);
router.delete("/:id", ordersController.deleteOrder);

module.exports = router;
