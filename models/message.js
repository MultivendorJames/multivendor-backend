const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  sender: { type: String, required: true },
  receiver: { type: String, required: true },
  content: { type: String, required: true },
  date: { type: Date, default: Date.now },
  seen: { type: Boolean, default: false },
});

const Message = mongoose.model("message", messageSchema);

module.exports = Message;
