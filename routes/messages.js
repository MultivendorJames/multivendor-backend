const express = require("express");
const router = express.Router();
const messagesController = require("../controllers/messages");

router.post("/", messagesController.sendMessage);
router.get("/", messagesController.listMessages);
router.get("/contacts/:id", messagesController.listContacts);

module.exports = router;
