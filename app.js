require("dotenv").config(); // dotenv
const express = require("express");
const http = require("http");
const socketIO = require("socket.io");
const cors = require("cors");

const { connectDB } = require("./config/db");
const User = require("./models/user");
const Message = require("./models/message");

const app = express();
app.use("/uploads", express.static("uploads"));

const server = http.createServer(app);
const io = socketIO(server, {
	cors: {
		origin: [process.env.FRONTEND_URL, "http://localhost:5173"],
	},
});

var corsOptions = {
	origin: [process.env.FRONTEND_URL, "http://localhost:5173"],
};

app.use(cors(corsOptions));

// parse requests of content-type - application/json
app.use(express.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

// Handle socket.io connections
io.on("connection", (socket) => {
	socket.on("join", (sender, receiver) => {
		const chat = [sender, receiver].sort().join("-");
		socket.join(chat);
	});

	socket.on("send_message", async ({ sender, receiver, content }) => {
		const newMessage = new Message({ sender, receiver, content });
		await newMessage.save();

		const chat = [sender, receiver].sort().join("-");
		io.to(chat).emit("receive_message", newMessage);

		const user = await User.findById(sender);
		io.emit("receive_notification", {
			receiverId: receiver,
			content: content,
			sender: user.name,
		});
	});

	socket.on("disconnect", () => {});
});

// routes
app.use("/uploads", require("./routes/upload")); // Upload file route
app.use("/stripe", require("./routes/stripe")); // Stripe route
app.use("/users", require("./routes/users")); // User route
app.use("/categories", require("./routes/categories")); // Category route
app.use("/products", require("./routes/products")); // Product route
app.use("/orders", require("./routes/orders")); // Order route
app.use("/messages", require("./routes/messages")); // Message route
app.use("/contacts", require("./routes/contact")); // Contact route
app.use("/payouts", require("./routes/transactions")); // Transaction route
app.use("/admin", require("./routes/admin")); // Admin route
app.use("/bookmarks", require("./routes/bookmarks")); // Bookmark route

// set port, listen for requests
const PORT = process.env.PORT || 8080;

(async function () {
	console.log("Connecting to database...");
	await connectDB(); // connecting db
	server.listen(PORT, () => {
		console.log(`Server is running on port ${PORT}.`);
	});
})();
