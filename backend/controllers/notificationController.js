const Notification = require("../models/Notification");

// Créer une notification
async function createNotification(req, res) {
  try {
    const { recipient, type, title, message, link, relatedId, sender } = req.body;

    // Vérifier les champs obligatoires
    if (!recipient || !type || !title || !message) {
      return res.status(400).json({ message: "Champs obligatoires manquants" });
    }

    // Créer la notification
    const notification = await Notification.create({
      recipient,
      type,
      title,
      message,
      link: link || "",
      relatedId: relatedId || null,
      sender: sender || null
    });

    return res.status(201).json({
      message: "Notification créée",
      notification: notification
    });
  } catch {
    return res.status(500).json({ message: "Erreur serveur" });
  }
}

// Récupérer toutes les notifications d'un utilisateur
async function getNotifications(req, res) {
  try {
    const { userId } = req.params;
    const { limit = 20, unreadOnly } = req.query;

    // Construire le filtre
    let filter = { recipient: userId };
    if (unreadOnly === "true") {
      filter.isRead = false;
    }

    const notifications = await Notification.find(filter)
      .populate("sender", "firstName lastName photo")
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    return res.status(200).json({
      message: "Notifications récupérées",
      count: notifications.length,
      notifications: notifications
    });
  } catch {
    return res.status(500).json({ message: "Erreur serveur" });
  }
}

// Compter les notifications non lues
async function getUnreadCount(req, res) {
  try {
    const { userId } = req.params;

    const count = await Notification.countDocuments({
      recipient: userId,
      isRead: false
    });

    return res.status(200).json({
      message: "Comptage effectué",
      unreadCount: count
    });
  } catch {
    return res.status(500).json({ message: "Erreur serveur" });
  }
}

// Marquer une notification comme lue
async function markAsRead(req, res) {
  try {
    const { notificationId } = req.params;

    const notification = await Notification.findByIdAndUpdate(
      notificationId,
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: "Notification non trouvée" });
    }

    return res.status(200).json({
      message: "Notification marquée comme lue",
      notification: notification
    });
  } catch {
    return res.status(500).json({ message: "Erreur serveur" });
  }
}

// Marquer toutes les notifications comme lues
async function markAllAsRead(req, res) {
  try {
    const { userId } = req.params;

    const result = await Notification.updateMany(
      { recipient: userId, isRead: false },
      { isRead: true }
    );

    return res.status(200).json({
      message: "Toutes les notifications marquées comme lues",
      modifiedCount: result.modifiedCount
    });
  } catch {
    return res.status(500).json({ message: "Erreur serveur" });
  }
}

// Supprimer une notification
async function deleteNotification(req, res) {
  try {
    const { notificationId } = req.params;

    const notification = await Notification.findByIdAndDelete(notificationId);

    if (!notification) {
      return res.status(404).json({ message: "Notification non trouvée" });
    }

    return res.status(200).json({
      message: "Notification supprimée"
    });
  } catch {
    return res.status(500).json({ message: "Erreur serveur" });
  }
}

// Supprimer toutes les notifications d'un utilisateur
async function deleteAllNotifications(req, res) {
  try {
    const { userId } = req.params;

    const result = await Notification.deleteMany({ recipient: userId });

    return res.status(200).json({
      message: "Toutes les notifications supprimées",
      deletedCount: result.deletedCount
    });
  } catch {
    return res.status(500).json({ message: "Erreur serveur" });
  }
}

// Fonction utilitaire pour créer une notification (utilisable par d'autres contrôleurs)
async function sendNotification(recipientId, type, title, message, options = {}) {
  try {
    const notification = await Notification.create({
      recipient: recipientId,
      type: type,
      title: title,
      message: message,
      link: options.link || "",
      relatedId: options.relatedId || null,
      sender: options.sender || null
    });
    return notification;
  } catch {
    console.log("Erreur lors de la création de la notification");
    return null;
  }
}

module.exports = {
  createNotification,
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications,
  sendNotification
};