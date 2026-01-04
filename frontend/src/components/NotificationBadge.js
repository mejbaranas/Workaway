import { useState, useEffect } from "react";
import { io } from "socket.io-client";

function NotificationBadge({ userId }) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Connexion au socket
    const newSocket = io("http://localhost:5000");
    setSocket(newSocket);

    // Rejoindre la room de l'utilisateur
    newSocket.emit("join", userId);

    // Charger le nombre de messages non lus
    fetchUnreadCount();

    // Ecouter les nouveaux messages
    newSocket.on("newMessage", (message) => {
      if (message.receiver && message.receiver._id === userId) {
        setUnreadCount((prev) => prev + 1);
      }
    });

    // Nettoyage a la deconnexion
    return () => {
      newSocket.disconnect();
    };
  }, [userId]);

  async function fetchUnreadCount() {
    try {
      const response = await fetch(`http://localhost:5000/api/messages/unread/${userId}`);
      const data = await response.json();

      if (response.ok) {
        setUnreadCount(data.count || 0);
      }
    } catch {
      console.error("Erreur lors du chargement des notifications");
    }
  }

  function resetCount() {
    setUnreadCount(0);
  }

  if (unreadCount === 0) {
    return null;
  }

  return (
    <span className="notification-badge">
      {unreadCount > 99 ? "99+" : unreadCount}
    </span>
  );
}

export default NotificationBadge;
