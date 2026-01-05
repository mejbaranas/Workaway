const express = require("express");
const {
  createNotification,
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications
} = require("../controllers/notificationController");

const router = express.Router();

// Créer une notification
router.post("/", createNotification);

// Compter les notifications non lues (doit être AVANT /:userId)
router.get("/user/:userId/unread-count", getUnreadCount);

// Marquer toutes comme lues
router.put("/user/:userId/read-all", markAllAsRead);

// Supprimer toutes les notifications
router.delete("/user/:userId/all", deleteAllNotifications);

// Récupérer les notifications d'un utilisateur
router.get("/user/:userId", getNotifications);

// Marquer une notification comme lue
router.put("/:notificationId/read", markAsRead);

// Supprimer une notification
router.delete("/:notificationId", deleteNotification);

module.exports = router;