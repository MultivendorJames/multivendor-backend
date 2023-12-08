const express = require("express");
const router = express.Router();
const transactionController = require("../controllers/transactions");
const user = require("../middlewares/user.middleware");
const admin = require("../middlewares/admin.middleware");

router.get("/", user, transactionController.getTransactions);
router.get("/all", user, admin, transactionController.adminGetTransactions);
router.put("/:transactionId/status", user, admin, transactionController.changeTransactionStatus);
router.post("/", user, transactionController.createPayout);
module.exports = router;
