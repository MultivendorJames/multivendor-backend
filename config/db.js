const mongoose = require("mongoose"); // mongoose

async function connectDB() {
  try {
    await mongoose
      .connect(process.env.MONGO_URI)
      .then(() => console.log("DB Connected!"));
  } catch (error) {
    console.log(`DB not connected: ${error}`);
  }
}

module.exports = { connectDB };
