import React, { useState, useEffect } from "react";
import "./GestionSignalements.css";

function GestionSignalements() {
  const [signalements, setSignalements] = useState([]);
  const [stats, setStats] = useState(null);
  const [selectedSignalement, setSelectedSignalement] = useState(null);
  const [filtreStatus, setFiltreStatus] = useState("");
  const [filtreType, setFiltreType] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");

  // Charger les signalements
  async function chargerSignalements() {
    setLoading(true);
    try {
      let url = "http://localhost:5000/api/admin/reports";
      const params = [];
      if (filtreStatus) params.push(`status=${filtreStatus}`);
      if (filtreType) params.push(`type=${filtreType}`);
      if (params.length > 0) url += "?" + params.join("&");

      const response = await fetch(url);
      const data = await response.json();
      setSignalements(data.signalements || []);
    } catch {
      setMessage("Erreur lors du chargement des signalements");
    }
    setLoading(false);
  }

  // Charger les statistiques
  async function chargerStats() {
    try {
      const response = await fetch("http://localhost:5000/api/admin/reports/stats");
      const data = await response.json();
      setStats(data.stats);
    } catch {
      console.log("Erreur lors du chargement des stats");
    }
  }

  useEffect(() => {
    chargerSignalements();
    chargerStats();
  }, [filtreStatus, filtreType]);

  // Voir les détails d'un signalement
  async function voirDetails(signalementId) {
    try {
      const response = await fetch(`http://localhost:5000/api/admin/reports/${signalementId}`);
      const data = await response.json();
      setSelectedSignalement(data.signalement);
      setShowModal(true);
      setAdminNotes("");
    } catch {
      setMessage("Erreur lors du chargement des détails");
    }
  }

  // Marquer comme en cours
  async function marquerEnCours(signalementId) {
    try {
      const response = await fetch(
        `http://localhost:5000/api/admin/reports/${signalementId}/in-progress`,
        { method: "PUT" }
      );
      const data = await response.json();
      setMessage(data.message);
      chargerSignalements();
      chargerStats();
    } catch {
      setMessage("Erreur lors de la mise à jour");
    }
  }

  // Traiter le signalement
  async function traiterSignalement(action) {
    if (!selectedSignalement) return;

    try {
      const response = await fetch(
        `http://localhost:5000/api/admin/reports/${selectedSignalement._id}/process`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: action,
            adminNotes: adminNotes
          })
        }
      );
      const data = await response.json();
      setMessage(data.message);
      setShowModal(false);
      setSelectedSignalement(null);
      chargerSignalements();
      chargerStats();
    } catch {
      setMessage("Erreur lors du traitement");
    }
  }

  // Supprimer un signalement
  async function supprimerSignalement(signalementId) {
    if (!window.confirm("Voulez-vous vraiment supprimer ce signalement ?")) return;

    try {
      const response = await fetch(
        `http://localhost:5000/api/admin/reports/${signalementId}`,
        { method: "DELETE" }
      );
      const data = await response.json();
      setMessage(data.message);
      chargerSignalements();
      chargerStats();
    } catch {
      setMessage("Erreur lors de la suppression");
    }
  }

  // Formater la date
  function formatDate(dateString) {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  }

  // Badge de status
  function getBadgeClass(status) {
    switch (status) {
      case "nouveau": return "badge-nouveau";
      case "en_cours": return "badge-en-cours";
      case "traite": return "badge-traite";
      case "rejete": return "badge-rejete";
      default: return "";
    }
  }

  // Badge de type
  function getTypeBadgeClass(type) {
    switch (type) {
      case "utilisateur": return "type-utilisateur";
      case "annonce": return "type-annonce";
      case "message": return "type-message";
      case "avis": return "type-avis";
      default: return "";
    }
  }

  // Label de raison
  function getRaisonLabel(reason) {
    const labels = {
      spam: "Spam",
      contenu_inapproprie: "Contenu inapproprié",
      harcelement: "Harcèlement",
      fausse_information: "Fausse information",
      arnaque: "Arnaque",
      comportement_suspect: "Comportement suspect",
      autre: "Autre"
    };
    return labels[reason] || reason;
  }

  return (
    <div className="gestion-signalements-container">
      <h2>Gestion des Signalements</h2>

      {message && (
        <div className="message-signalement">
          {message}
          <button onClick={() => setMessage("")}>×</button>
        </div>
      )}

      {/* Statistiques */}
      {stats && (
        <div className="stats-container">
          <div className="stat-card stat-total">
            <span className="stat-number">{stats.total}</span>
            <span className="stat-label">Total</span>
          </div>
          <div className="stat-card stat-nouveau">
            <span className="stat-number">{stats.nouveau}</span>
            <span className="stat-label">Nouveaux</span>
          </div>
          <div className="stat-card stat-encours">
            <span className="stat-number">{stats.enCours}</span>
            <span className="stat-label">En cours</span>
          </div>
          <div className="stat-card stat-traite">
            <span className="stat-number">{stats.traite}</span>
            <span className="stat-label">Traités</span>
          </div>
        </div>
      )}

      {/* Filtres */}
      <div className="filtres-container">
        <div className="filtre-group">
          <label>Filtrer par statut:</label>
          <select 
            value={filtreStatus} 
            onChange={(e) => setFiltreStatus(e.target.value)}
          >
            <option value="">Tous</option>
            <option value="nouveau">Nouveau</option>
            <option value="en_cours">En cours</option>
            <option value="traite">Traité</option>
            <option value="rejete">Rejeté</option>
          </select>
        </div>
        <div className="filtre-group">
          <label>Filtrer par type:</label>
          <select 
            value={filtreType} 
            onChange={(e) => setFiltreType(e.target.value)}
          >
            <option value="">Tous</option>
            <option value="utilisateur">Utilisateur</option>
            <option value="annonce">Annonce</option>
            <option value="message">Message</option>
            <option value="avis">Avis</option>
          </select>
        </div>
        <button className="btn-refresh" onClick={chargerSignalements}>
          🔄 Actualiser
        </button>
      </div>

      {/* Liste des signalements */}
      {loading ? (
        <p className="loading-text">Chargement...</p>
      ) : signalements.length === 0 ? (
        <p className="empty-text">Aucun signalement trouvé</p>
      ) : (
        <table className="signalements-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Raison</th>
              <th>Signalé par</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {signalements.map((signalement) => (
              <tr key={signalement._id}>
                <td>{formatDate(signalement.createdAt)}</td>
                <td>
                  <span className={`type-badge ${getTypeBadgeClass(signalement.type)}`}>
                    {signalement.type}
                  </span>
                </td>
                <td>{getRaisonLabel(signalement.reason)}</td>
                <td>
                  {signalement.reportedBy 
                    ? `${signalement.reportedBy.firstName} ${signalement.reportedBy.lastName}`
                    : "Inconnu"}
                </td>
                <td>
                  <span className={`status-badge ${getBadgeClass(signalement.status)}`}>
                    {signalement.status.replace("_", " ")}
                  </span>
                </td>
                <td className="actions-cell">
                  <button 
                    className="btn-voir"
                    onClick={() => voirDetails(signalement._id)}
                  >
                    👁️ Voir
                  </button>
                  {signalement.status === "nouveau" && (
                    <button 
                      className="btn-encours"
                      onClick={() => marquerEnCours(signalement._id)}
                    >
                      📋 En cours
                    </button>
                  )}
                  <button 
                    className="btn-supprimer"
                    onClick={() => supprimerSignalement(signalement._id)}
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Modal de détails */}
      {showModal && selectedSignalement && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Détails du signalement</h3>
              <button className="btn-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="detail-row">
                <strong>Type:</strong>
                <span className={`type-badge ${getTypeBadgeClass(selectedSignalement.type)}`}>
                  {selectedSignalement.type}
                </span>
              </div>
              <div className="detail-row">
                <strong>Raison:</strong>
                <span>{getRaisonLabel(selectedSignalement.reason)}</span>
              </div>
              <div className="detail-row">
                <strong>Description:</strong>
                <p>{selectedSignalement.description || "Aucune description"}</p>
              </div>
              <div className="detail-row">
                <strong>Signalé par:</strong>
                <span>
                  {selectedSignalement.reportedBy 
                    ? `${selectedSignalement.reportedBy.firstName} ${selectedSignalement.reportedBy.lastName} (${selectedSignalement.reportedBy.email})`
                    : "Inconnu"}
                </span>
              </div>
              <div className="detail-row">
                <strong>Date:</strong>
                <span>{formatDate(selectedSignalement.createdAt)}</span>
              </div>
              <div className="detail-row">
                <strong>Statut actuel:</strong>
                <span className={`status-badge ${getBadgeClass(selectedSignalement.status)}`}>
                  {selectedSignalement.status.replace("_", " ")}
                </span>
              </div>
              {selectedSignalement.actionTaken && (
                <div className="detail-row">
                  <strong>Action prise:</strong>
                  <span>{selectedSignalement.actionTaken}</span>
                </div>
              )}
              {selectedSignalement.adminNotes && (
                <div className="detail-row">
                  <strong>Notes admin:</strong>
                  <p>{selectedSignalement.adminNotes}</p>
                </div>
              )}

              {/* Actions pour traiter */}
              {selectedSignalement.status !== "traite" && selectedSignalement.status !== "rejete" && (
                <div className="traitement-section">
                  <h4>Traiter ce signalement</h4>
                  <div className="notes-input">
                    <label>Notes administrateur:</label>
                    <textarea
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      placeholder="Ajouter des notes..."
                      rows={3}
                    />
                  </div>
                  <div className="actions-traitement">
                    <button 
                      className="btn-avertissement"
                      onClick={() => traiterSignalement("avertissement")}
                    >
                      ⚠️ Avertissement
                    </button>
                    <button 
                      className="btn-suspension"
                      onClick={() => traiterSignalement("suspension")}
                    >
                      🚫 Suspension
                    </button>
                    <button 
                      className="btn-suppression"
                      onClick={() => traiterSignalement("suppression")}
                    >
                      🗑️ Suppression
                    </button>
                    <button 
                      className="btn-rejet"
                      onClick={() => traiterSignalement("rejet")}
                    >
                      ❌ Rejeter
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default GestionSignalements;
