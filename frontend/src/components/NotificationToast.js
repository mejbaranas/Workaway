import { useState, useEffect } from "react";
import { io } from "socket.io-client";
import "./Notification.css";

function NotificationToast({ userId }) {
  const [notifications, setNotifications] = useState([]);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Connexion au socket
    const newSocket = io("http://localhost:5000");
    setSocket(newSocket);

    // Rejoindre la room de l'utilisateur
    newSocket.emit("join", userId);

    // Ecouter les nouveaux messages
    newSocket.on("newMessage", (message) => {
      if (message.receiver && message.receiver._id === userId) {
        addNotification({
          id: Date.now(),
          type: "message",
          title: "Nouveau message",
          content: `${message.sender.firstName} vous a envoyé un message`,
          data: message
        });
      }
    });

    // Nettoyage a la deconnexion
    return () => {
      newSocket.disconnect();
    };
  }, [userId]);

  function addNotification(notification) {
    setNotifications((prev) => [...prev, notification]);

    // Supprimer la notification apres 5 secondes
    setTimeout(() => {
      removeNotification(notification.id);
    }, 5000);
  }

  function removeNotification(id) {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }

  return (
    <div className="notification-container">
      {notifications.map((notification) => (
        <div key={notification.id} className="notification-toast">
          <div className="notification-icon">💬</div>
          <div className="notification-content">
            <div className="notification-title">{notification.title}</div>
            <div className="notification-text">{notification.content}</div>
          </div>
          <button
            className="notification-close"
            onClick={() => removeNotification(notification.id)}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}

export default NotificationToast;
