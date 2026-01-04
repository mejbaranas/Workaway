import { useState, useEffect } from "react";

function Calendrier({ annonceId, isHost }) {
  const [disponibilites, setDisponibilites] = useState([]);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    startDate: "",
    endDate: "",
    type: "available"
  });

  useEffect(() => {
    fetchCalendrier();
  }, [annonceId]);

  async function fetchCalendrier() {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/annonces/${annonceId}/calendrier`);
      const data = await response.json();

      if (response.ok) {
        setDisponibilites(data.disponibilites || []);
        setTitle(data.title || "");
      } else {
        setError(data.message || "Erreur lors du chargement");
      }
    } catch {
      setError("Erreur de connexion au serveur");
    } finally {
      setLoading(false);
    }
  }

  async function handleAddDisponibilite(e) {
    e.preventDefault();

    if (!formData.startDate || !formData.endDate) {
      setError("Veuillez remplir les dates");
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/annonces/${annonceId}/calendrier`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        setDisponibilites(data.disponibilites);
        setShowForm(false);
        setFormData({ startDate: "", endDate: "", type: "available" });
        setError("");
      } else {
        setError(data.message);
      }
    } catch {
      setError("Erreur de connexion au serveur");
    }
  }

  async function handleDeleteDisponibilite(dispoId) {
    try {
      const response = await fetch(
        `http://localhost:5000/api/annonces/${annonceId}/calendrier/${dispoId}`,
        { method: "DELETE" }
      );

      const data = await response.json();

      if (response.ok) {
        setDisponibilites(data.disponibilites);
      } else {
        setError(data.message);
      }
    } catch {
      setError("Erreur de connexion au serveur");
    }
  }

  function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString("fr-FR");
  }

  function getTypeLabel(type) {
    return type === "blocked" ? "Bloqué" : "Disponible";
  }

  function getTypeClass(type) {
    return type === "blocked" ? "type-blocked" : "type-available";
  }

  if (loading) {
    return <div className="calendrier-loading">Chargement du calendrier...</div>;
  }

  return (
    <div className="calendrier">
      <h2 className="calendrier-title">
        Calendrier {title && `- ${title}`}
      </h2>

      {error && <div className="calendrier-error">{error}</div>}

      {isHost && (
        <div className="calendrier-actions">
          <button
            className="btn-add-dispo"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? "Annuler" : "+ Ajouter une disponibilité"}
          </button>
        </div>
      )}

      {showForm && isHost && (
        <form className="calendrier-form" onSubmit={handleAddDisponibilite}>
          <div className="form-group">
            <label>Date de début :</label>
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Date de fin :</label>
            <input
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Type :</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            >
              <option value="available">Disponible</option>
              <option value="blocked">Bloqué</option>
            </select>
          </div>

          <button type="submit" className="btn-submit">
            Ajouter
          </button>
        </form>
      )}

      {disponibilites.length === 0 ? (
        <p className="calendrier-empty">Aucune disponibilité définie</p>
      ) : (
        <div className="calendrier-list">
          {disponibilites.map((dispo) => (
            <div key={dispo._id} className={`calendrier-item ${getTypeClass(dispo.type)}`}>
              <div className="dispo-dates">
                <span className="dispo-icon">📅</span>
                <span>{formatDate(dispo.startDate)} - {formatDate(dispo.endDate)}</span>
              </div>
              <div className="dispo-info">
                <span className={`dispo-badge ${getTypeClass(dispo.type)}`}>
                  {getTypeLabel(dispo.type)}
                </span>
                {isHost && (
                  <button
                    className="btn-delete-dispo"
                    onClick={() => handleDeleteDisponibilite(dispo._id)}
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="calendrier-legend">
        <span className="legend-item">
          <span className="legend-color available"></span> Disponible
        </span>
        <span className="legend-item">
          <span className="legend-color blocked"></span> Bloqué
        </span>
      </div>
    </div>
  );
}

export default Calendrier;
