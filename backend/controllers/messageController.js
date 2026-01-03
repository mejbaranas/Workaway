const mongoose = require("mongoose");
const Message = require("../models/Message");

function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

async function sendMessage(req, res) {
  try {
    const { sender, receiver, content } = req.body;

    if (!sender || !receiver || !content) {
      return res.status(400).json({ message: "Champs manquants" });
    }

    if (!isValidObjectId(sender) || !isValidObjectId(receiver)) {
      return res.status(400).json({ message: "Id invalide" });
    }

    const message = await Message.create({
      sender,
      receiver,
      content: String(content).trim()
    });

    const populatedMessage = await Message.findById(message._id)
      .populate("sender", "firstName lastName")
      .populate("receiver", "firstName lastName");

    const io = req.app.get("io");
    if (io) {
      io.to(receiver).emit("newMessage", populatedMessage);
    }

    return res.status(201).json({ message: "Message envoyé", data: populatedMessage });
  } catch {
    return res.status(500).json({ message: "Erreur serveur" });
  }
}

async function getConversation(req, res) {
  try {
    const { userId1, userId2 } = req.params;

    if (!isValidObjectId(userId1) || !isValidObjectId(userId2)) {
      return res.status(400).json({ message: "Id invalide" });
    }

    const messages = await Message.find({
      $or: [
        { sender: userId1, receiver: userId2 },
        { sender: userId2, receiver: userId1 }
      ]
    })
      .populate("sender", "firstName lastName")
      .populate("receiver", "firstName lastName")
      .sort({ createdAt: 1 });

    return res.status(200).json({ messages });
  } catch {
    return res.status(500).json({ message: "Erreur serveur" });
  }
}

async function getUserConversations(req, res) {
  try {
    const { userId } = req.params;

    if (!isValidObjectId(userId)) {
      return res.status(400).json({ message: "Id invalide" });
    }

    const messages = await Message.aggregate([
      {
        $match: {
          $or: [
            { sender: new mongoose.Types.ObjectId(userId) },
            { receiver: new mongoose.Types.ObjectId(userId) }
          ]
        }
      },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ["$sender", new mongoose.Types.ObjectId(userId)] },
              "$receiver",
              "$sender"
            ]
          },
          lastMessage: { $first: "$$ROOT" }
        }
      }
    ]);

    await Message.populate(messages, [
      { path: "lastMessage.sender", select: "firstName lastName" },
      { path: "lastMessage.receiver", select: "firstName lastName" }
    ]);

    return res.status(200).json({ conversations: messages });
  } catch {
    return res.status(500).json({ message: "Erreur serveur" });
  }
}

async function markAsRead(req, res) {
  try {
    const { messageId } = req.params;

    if (!isValidObjectId(messageId)) {
      return res.status(400).json({ message: "Id invalide" });
    }

    const message = await Message.findByIdAndUpdate(
      messageId,
      { read: true },
      { new: true }
    );

    if (!message) {
      return res.status(404).json({ message: "Message introuvable" });
    }

    return res.status(200).json({ message: "Message lu", data: message });
  } catch {
    return res.status(500).json({ message: "Erreur serveur" });
  }
}

module.exports = {
  sendMessage,
  getConversation,
  getUserConversations,
  markAsRead
};
