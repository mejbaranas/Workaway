import { useState, useEffect } from "react";

function Inbox({ userId }) {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchConversations();
  }, [userId]);

  async function fetchConversations() {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/messages/user/${userId}`);
      const data = await response.json();

      if (response.ok) {
        setConversations(data.conversations || []);
      } else {
        setError(data.message || "Erreur lors du chargement");
      }
    } catch {
      setError("Erreur de connexion au serveur");
    } finally {
      setLoading(false);
    }
  }

  function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
    } else if (days === 1) {
      return "Hier";
    } else if (days < 7) {
      return date.toLocaleDateString("fr-FR", { weekday: "long" });
    } else {
      return date.toLocaleDateString("fr-FR");
    }
  }

  function getOtherUser(conversation, currentUserId) {
    const lastMessage = conversation.lastMessage;
    if (!lastMessage) {
      return { firstName: "Utilisateur", lastName: "Inconnu" };
    }
    
    const sender = lastMessage.sender || { _id: null, firstName: "Utilisateur", lastName: "Inconnu" };
    const receiver = lastMessage.receiver || { _id: null, firstName: "Utilisateur", lastName: "Inconnu" };
    
    if (sender._id === currentUserId) {
      return receiver;
    }
    return sender;
  }

  if (loading) {
    return <div className="inbox-loading">Chargement...</div>;
  }

  if (error) {
    return <div className="inbox-error">{error}</div>;
  }

  return (
    <div className="inbox">
      <h2 className="inbox-title">Mes conversations</h2>

      {conversations.length === 0 ? (
        <p className="inbox-empty">Aucune conversation</p>
      ) : (
        <ul className="inbox-list">
          {conversations.map((conversation) => {
            const otherUser = getOtherUser(conversation, userId);
            const lastMessage = conversation.lastMessage;

            return (
              <li key={conversation._id} className="inbox-item">
                <div className="inbox-avatar">
                  {otherUser.firstName ? otherUser.firstName.charAt(0).toUpperCase() : "?"}
                </div>

                <div className="inbox-content">
                  <div className="inbox-header">
                    <span className="inbox-name">
                      {otherUser.firstName} {otherUser.lastName}
                    </span>
                    <span className="inbox-date">
                      {lastMessage && lastMessage.createdAt ? formatDate(lastMessage.createdAt) : ""}
                    </span>
                  </div>

                  <p className="inbox-preview">
                    {lastMessage && lastMessage.content
                      ? (lastMessage.content.length > 50
                          ? lastMessage.content.substring(0, 50) + "..."
                          : lastMessage.content)
                      : "Aucun message"}
                  </p>
                </div>

                {lastMessage && !lastMessage.read && lastMessage.receiver && lastMessage.receiver._id === userId && (
                  <span className="inbox-unread"></span>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default Inbox;
