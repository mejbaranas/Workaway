import { useState, useEffect } from "react";

function ProfilAvis({ userId }) {
  const [avis, setAvis] = useState([]);
  const [stats, setStats] = useState({ moyenne: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAvis();
  }, [userId]);

  async function fetchAvis() {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/avis/volontaire/${userId}`);
      const data = await response.json();

      if (response.ok) {
        setAvis(data.avis || []);
        setStats(data.stats || { moyenne: 0, total: 0 });
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
    return new Date(dateString).toLocaleDateString("fr-FR");
  }

  function renderStars(note) {
    return (
      <span className="stars">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={star <= note ? "star-filled" : "star-empty"}
          >
            ★
          </span>
        ))}
      </span>
    );
  }

  if (loading) {
    return <div className="profil-avis-loading">Chargement des avis...</div>;
  }

  return (
    <div className="profil-avis">
      <h2>Avis sur ce volontaire</h2>

      {error && <div className="avis-error">{error}</div>}

      <div className="avis-stats">
        <div className="stats-moyenne">
          <span className="moyenne-value">{stats.moyenne ? stats.moyenne.toFixed(1) : "0"}</span>
          <span className="moyenne-max">/5</span>
        </div>
        <div className="stats-stars">
          {renderStars(Math.round(stats.moyenne))}
        </div>
        <div className="stats-total">
          {stats.total} avis
        </div>
      </div>

      {avis.length === 0 ? (
        <p className="avis-empty">Aucun avis pour le moment</p>
      ) : (
        <div className="avis-list">
          {avis.map((item) => (
            <div key={item._id} className="avis-item">
              <div className="avis-header">
                <div className="avis-author">
                  <span className="author-avatar">
                    {item.author && item.author.firstName
                      ? item.author.firstName.charAt(0).toUpperCase()
                      : "?"}
                  </span>
                  <span className="author-name">
                    {item.author
                      ? `${item.author.firstName} ${item.author.lastName}`
                      : "Utilisateur inconnu"}
                  </span>
                </div>
                <div className="avis-note">
                  {renderStars(item.note)}
                </div>
              </div>
              <p className="avis-commentaire">{item.commentaire}</p>
              <span className="avis-date">{formatDate(item.createdAt)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ProfilAvis;
