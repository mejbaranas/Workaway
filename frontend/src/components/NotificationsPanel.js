import React, { useState, useEffect } from "react";
import "./NotificationsPanel.css";

function NotificationsPanel({ userId }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showPanel, setShowPanel] = useState(false);
  const [loading, setLoading] = useState(false);

  // Charger le nombre de notifications non lues
  async function chargerUnreadCount() {
    try {
      const response = await fetch(
        `http://localhost:5000/api/notifications/user/${userId}/unread-count`
      );
      const data = await response.json();
      setUnreadCount(data.unreadCount || 0);
    } catch {
      console.log("Erreur lors du chargement du compteur");
    }
  }

  // Charger les notifications
  async function chargerNotifications() {
    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:5000/api/notifications/user/${userId}?limit=20`
      );
      const data = await response.json();
      setNotifications(data.notifications || []);
    } catch {
      console.log("Erreur lors du chargement des notifications");
    }
    setLoading(false);
  }

  // Charger au montage et toutes les 30 secondes
  useEffect(() => {
    if (userId) {
      chargerUnreadCount();
      const interval = setInterval(chargerUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [userId]);

  // Charger les notifications quand on ouvre le panel
  useEffect(() => {
    if (showPanel && userId) {
      chargerNotifications();
    }
  }, [showPanel, userId]);

  // Marquer une notification comme lue
  async function marquerCommeLue(notificationId) {
    try {
      await fetch(
        `http://localhost:5000/api/notifications/${notificationId}/read`,
        { method: "PUT" }
      );
      // Mettre à jour l'état local
      setNotifications(
        notifications.map((n) =>
          n._id === notificationId ? { ...n, isRead: true } : n
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
      console.log("Erreur lors du marquage");
    }
  }

  // Marquer toutes comme lues
  async function marquerToutesCommeLues() {
    try {
      await fetch(
        `http://localhost:5000/api/notifications/user/${userId}/read-all`,
        { method: "PUT" }
      );
      setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {
      console.log("Erreur lors du marquage");
    }
  }

  // Supprimer une notification
  async function supprimerNotification(notificationId) {
    try {
      await fetch(
        `http://localhost:5000/api/notifications/${notificationId}`,
        { method: "DELETE" }
      );
      const notif = notifications.find((n) => n._id === notificationId);
      setNotifications(notifications.filter((n) => n._id !== notificationId));
      if (notif && !notif.isRead) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch {
      console.log("Erreur lors de la suppression");
    }
  }

  // Formater la date
  function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "À l'instant";
    if (minutes < 60) return `Il y a ${minutes} min`;
    if (hours < 24) return `Il y a ${hours}h`;
    if (days < 7) return `Il y a ${days}j`;
    return date.toLocaleDateString("fr-FR");
  }

  // Icône selon le type
  function getIcon(type) {
    const icons = {
      message: "💬",
      candidature: "📝",
      candidature_acceptee: "✅",
      candidature_refusee: "❌",
      nouvel_avis: "⭐",
      annonce_approuvee: "✔️",
      annonce_rejetee: "🚫",
      verification: "🔐",
      signalement: "🚨",
      systeme: "🔔"
    };
    return icons[type] || "🔔";
  }

  return (
    <div className="notifications-container">
      {/* Bouton cloche avec badge */}
      <button
        className="notifications-button"
        onClick={() => setShowPanel(!showPanel)}
      >
        <span className="bell-icon">🔔</span>
        {unreadCount > 0 && (
          <span className="notifications-badge">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Panel des notifications */}
      {showPanel && (
        <div className="notifications-panel">
          <div className="notifications-header">
            <h3>Notifications</h3>
            {unreadCount > 0 && (
              <button
                className="btn-mark-all"
                onClick={marquerToutesCommeLues}
              >
                Tout marquer comme lu
              </button>
            )}
          </div>

          <div className="notifications-list">
            {loading ? (
              <p className="notifications-loading">Chargement...</p>
            ) : notifications.length === 0 ? (
              <p className="notifications-empty">Aucune notification</p>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif._id}
                  className={`notification-item ${
                    !notif.isRead ? "unread" : ""
                  }`}
                >
                  <div className="notification-icon">
                    {getIcon(notif.type)}
                  </div>
                  <div
                    className="notification-content"
                    onClick={() => !notif.isRead && marquerCommeLue(notif._id)}
                  >
                    <p className="notification-title">{notif.title}</p>
                    <p className="notification-message">{notif.message}</p>
                    <span className="notification-time">
                      {formatDate(notif.createdAt)}
                    </span>
                  </div>
                  <button
                    className="btn-delete-notif"
                    onClick={() => supprimerNotification(notif._id)}
                  >
                    ×
                  </button>
                </div>
              ))
            )}
          </div>

          {notifications.length > 0 && (
            <div className="notifications-footer">
              <button
                className="btn-refresh"
                onClick={chargerNotifications}
              >
                🔄 Actualiser
              </button>
            </div>
          )}
        </div>
      )}

      {/* Overlay pour fermer le panel */}
      {showPanel && (
        <div
          className="notifications-overlay"
          onClick={() => setShowPanel(false)}
        />
      )}
    </div>
  );
}

export default NotificationsPanel;
