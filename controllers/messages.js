const Message = require("../models/message");
const User = require("../models/user");

exports.sendMessage = async (req, res) => {
  try {
    const { sender, receiver, content } = req.body;

    // Save the message to the database
    const message = new Message({ sender, receiver, content });
    await message.save();

    // Find the receiver's socket connection
    const receiverSocket = req.io.sockets.sockets.get(receiver);

    if (receiverSocket) {
      // Emit the message to the receiver
      receiverSocket.emit("newMessage", message);
    }

    res.status(201).json(message);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
};

// All messages
exports.listMessages = async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        {
          $and: [
            { sender: req.query.sender },
            { receiver: req.query.receiver },
          ],
        },
        {
          $and: [
            { sender: req.query.receiver },
            { receiver: req.query.sender },
          ],
        },
      ],
    });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// All contacts
exports.listContacts = async (req, res) => {
  const userId = req.params.id; // The user ID you want to find contacts for

  try {
    // Find all distinct sender and receiver values from the messages collection
    const contacts = await Message.aggregate([
      {
        $match: {
          $or: [{ receiver: userId }, { sender: userId }],
        },
      },
      {
        $project: {
          contactId: {
            $cond: {
              if: { $eq: ["$sender", userId] },
              then: "$receiver",
              else: "$sender",
            },
          },
        },
      },
      {
        $group: {
          _id: null,
          contacts: { $addToSet: "$contactId" },
        },
      },
    ]);

    // Extract the contacts array from the result
    const result = contacts[0];

    if (result && result.contacts.length > 0) {
      const contactIds = result.contacts;

      // Fetch user data based on contact IDs
      const users = await User.find({ _id: { $in: contactIds } });

      res.json(users);
    } else {
      res.json([]); // Return an empty array if no contacts found
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
