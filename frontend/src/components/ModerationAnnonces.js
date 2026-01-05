import { useState, useEffect } from "react";

function ModerationAnnonces() {
  // États pour les données
  const [annonces, setAnnonces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // État pour le filtre
  const [filterStatus, setFilterStatus] = useState("all");
  const [showReported, setShowReported] = useState(false);

  // État pour le modal de rejet
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedAnnonce, setSelectedAnnonce] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  // État pour le modal de détails
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Charger les annonces au démarrage
  useEffect(() => {
    if (showReported) {
      fetchReportedAnnonces();
    } else {
      fetchAnnonces();
    }
  }, [filterStatus, showReported]);

  // Récupérer toutes les annonces
  async function fetchAnnonces() {
    try {
      setLoading(true);
      setError("");

      let url = "http://localhost:5000/api/admin/annonces";
      if (filterStatus !== "all") {
        url += `?status=${filterStatus}`;
      }

      const response = await fetch(url);
      const data = await response.json();

      if (response.ok) {
        setAnnonces(data.annonces || []);
      } else {
        setError(data.message || "Erreur lors du chargement");
      }
    } catch {
      setError("Erreur de connexion au serveur");
    } finally {
      setLoading(false);
    }
  }

  // Récupérer les annonces signalées
  async function fetchReportedAnnonces() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("http://localhost:5000/api/admin/annonces/reported");
      const data = await response.json();

      if (response.ok) {
        setAnnonces(data.annonces || []);
      } else {
        setError(data.message || "Erreur lors du chargement");
      }
    } catch {
      setError("Erreur de connexion au serveur");
    } finally {
      setLoading(false);
    }
  }

  // Approuver une annonce
  async function handleApprove(annonceId) {
    try {
      setMessage("");
      setError("");

      const response = await fetch(`http://localhost:5000/api/admin/annonces/${annonceId}/approve`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({})
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("Annonce approuvée avec succès");
        fetchAnnonces();
      } else {
        setError(data.message || "Erreur lors de l'approbation");
      }
    } catch {
      setError("Erreur de connexion au serveur");
    }
  }

  // Ouvrir le modal de rejet
  function openRejectModal(annonce) {
    setSelectedAnnonce(annonce);
    setRejectReason("");
    setShowRejectModal(true);
  }

  // Fermer le modal de rejet
  function closeRejectModal() {
    setShowRejectModal(false);
    setSelectedAnnonce(null);
    setRejectReason("");
  }

  // Rejeter une annonce
  async function handleReject() {
    try {
      setMessage("");
      setError("");

      const response = await fetch(`http://localhost:5000/api/admin/annonces/${selectedAnnonce._id}/reject`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: rejectReason })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("Annonce rejetée");
        closeRejectModal();
        fetchAnnonces();
      } else {
        setError(data.message || "Erreur lors du rejet");
      }
    } catch {
      setError("Erreur de connexion au serveur");
    }
  }

  // Effacer les signalements
  async function handleClearReports(annonceId) {
    try {
      setMessage("");
      setError("");

      const response = await fetch(`http://localhost:5000/api/admin/annonces/${annonceId}/clear-reports`, {
        method: "PUT"
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("Signalements effacés");
        if (showReported) {
          fetchReportedAnnonces();
        } else {
          fetchAnnonces();
        }
      } else {
        setError(data.message || "Erreur");
      }
    } catch {
      setError("Erreur de connexion au serveur");
    }
  }

  // Supprimer une annonce
  async function handleDelete(annonceId) {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette annonce ?")) {
      return;
    }

    try {
      setMessage("");
      setError("");

      const response = await fetch(`http://localhost:5000/api/admin/annonces/${annonceId}`, {
        method: "DELETE"
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("Annonce supprimée");
        fetchAnnonces();
      } else {
        setError(data.message || "Erreur lors de la suppression");
      }
    } catch {
      setError("Erreur de connexion au serveur");
    }
  }

  // Ouvrir le modal de détails
  function openDetailsModal(annonce) {
    setSelectedAnnonce(annonce);
    setShowDetailsModal(true);
  }

  // Fermer le modal de détails
  function closeDetailsModal() {
    setShowDetailsModal(false);
    setSelectedAnnonce(null);
  }

  // Formater la date
  function formatDate(dateString) {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("fr-FR");
  }

  // Obtenir le badge de statut de modération
  function getModerationBadge(status) {
    switch (status) {
      case "en_attente":
        return <span className="mod-badge mod-pending">En attente</span>;
      case "approuvee":
        return <span className="mod-badge mod-approved">Approuvée</span>;
      case "rejetee":
        return <span className="mod-badge mod-rejected">Rejetée</span>;
      default:
        return <span className="mod-badge mod-pending">En attente</span>;
    }
  }

  // Affichage du chargement
  if (loading) {
    return <div className="moderation-loading">Chargement des annonces...</div>;
  }

  return (
    <div className="moderation-annonces">
      <h2 className="moderation-title">Modération des annonces</h2>

      {/* Messages */}
      {message && <div className="moderation-success">{message}</div>}
      {error && <div className="moderation-error">{error}</div>}

      {/* Statistiques */}
      <div className="moderation-stats">
        <div className="stat-card">
          <span className="stat-number">{annonces.length}</span>
          <span className="stat-label">Total</span>
        </div>
        <div className="stat-card stat-pending">
          <span className="stat-number">
            {annonces.filter(a => a.moderationStatus === "en_attente").length}
          </span>
          <span className="stat-label">En attente</span>
        </div>
        <div className="stat-card stat-reported">
          <span className="stat-number">
            {annonces.filter(a => a.isReported).length}
          </span>
          <span className="stat-label">Signalées</span>
        </div>
      </div>

      {/* Filtres */}
      <div className="moderation-filters">
        <div className="filter-group">
          <label>Statut de modération :</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select"
            disabled={showReported}
          >
            <option value="all">Tous</option>
            <option value="en_attente">En attente</option>
            <option value="approuvee">Approuvées</option>
            <option value="rejetee">Rejetées</option>
          </select>
        </div>
        <button
          className={`btn-filter ${showReported ? "active" : ""}`}
          onClick={() => setShowReported(!showReported)}
        >
          {showReported ? "Voir toutes" : "🚨 Voir signalées"}
        </button>
      </div>

      {/* Tableau des annonces */}
      <div className="table-container">
        <table className="moderation-table">
          <thead>
            <tr>
              <th>Titre</th>
              <th>Auteur</th>
              <th>Lieu</th>
              <th>Statut</th>
              <th>Signalements</th>
              <th>Créée le</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {annonces.length === 0 ? (
              <tr>
                <td colSpan="7" className="no-data">Aucune annonce</td>
              </tr>
            ) : (
              annonces.map((annonce) => (
                <tr key={annonce._id} className={annonce.isReported ? "row-reported" : ""}>
                  <td>
                    <div className="annonce-title" onClick={() => openDetailsModal(annonce)}>
                      {annonce.title}
                    </div>
                  </td>
                  <td>
                    {annonce.createdBy ? (
                      `${annonce.createdBy.firstName} ${annonce.createdBy.lastName}`
                    ) : (
                      "Inconnu"
                    )}
                  </td>
                  <td>{annonce.city}, {annonce.country}</td>
                  <td>{getModerationBadge(annonce.moderationStatus)}</td>
                  <td>
                    {annonce.isReported ? (
                      <span className="report-count">🚨 {annonce.reportCount}</span>
                    ) : (
                      <span className="no-reports">0</span>
                    )}
                  </td>
                  <td>{formatDate(annonce.createdAt)}</td>
                  <td>
                    <div className="action-buttons">
                      {annonce.moderationStatus === "en_attente" && (
                        <>
                          <button
                            className="btn-approve"
                            onClick={() => handleApprove(annonce._id)}
                          >
                            ✓ Approuver
                          </button>
                          <button
                            className="btn-reject"
                            onClick={() => openRejectModal(annonce)}
                          >
                            ✗ Rejeter
                          </button>
                        </>
                      )}
                      {annonce.isReported && (
                        <button
                          className="btn-clear"
                          onClick={() => handleClearReports(annonce._id)}
                        >
                          Effacer signalements
                        </button>
                      )}
                      <button
                        className="btn-delete"
                        onClick={() => handleDelete(annonce._id)}
                      >
                        Supprimer
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal de rejet */}
      {showRejectModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Rejeter l'annonce</h3>
            <p>Vous allez rejeter : <strong>{selectedAnnonce?.title}</strong></p>
            <div className="form-group">
              <label>Raison du rejet</label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Expliquez pourquoi cette annonce est rejetée..."
                rows={3}
              />
            </div>
            <div className="modal-buttons">
              <button className="btn-cancel" onClick={closeRejectModal}>Annuler</button>
              <button className="btn-reject" onClick={handleReject}>Rejeter</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de détails */}
      {showDetailsModal && selectedAnnonce && (
        <div className="modal-overlay">
          <div className="modal modal-large">
            <h3>Détails de l'annonce</h3>
            <div className="annonce-details">
              <div className="detail-row">
                <strong>Titre :</strong>
                <span>{selectedAnnonce.title}</span>
              </div>
              <div className="detail-row">
                <strong>Description :</strong>
                <p>{selectedAnnonce.description}</p>
              </div>
              <div className="detail-row">
                <strong>Lieu :</strong>
                <span>{selectedAnnonce.city}, {selectedAnnonce.country}</span>
              </div>
              <div className="detail-row">
                <strong>Auteur :</strong>
                <span>
                  {selectedAnnonce.createdBy ? (
                    `${selectedAnnonce.createdBy.firstName} ${selectedAnnonce.createdBy.lastName} (${selectedAnnonce.createdBy.email})`
                  ) : "Inconnu"}
                </span>
              </div>
              <div className="detail-row">
                <strong>Statut :</strong>
                {getModerationBadge(selectedAnnonce.moderationStatus)}
              </div>
              {selectedAnnonce.rejectionReason && (
                <div className="detail-row">
                  <strong>Raison du rejet :</strong>
                  <span className="rejection-reason">{selectedAnnonce.rejectionReason}</span>
                </div>
              )}
              {selectedAnnonce.isReported && selectedAnnonce.signalements && (
                <div className="detail-row">
                  <strong>Signalements ({selectedAnnonce.reportCount}) :</strong>
                  <div className="signalements-list">
                    {selectedAnnonce.signalements.map((sig, index) => (
                      <div key={index} className="signalement-item">
                        <span className="sig-reason">• {sig.reason}</span>
                        {sig.description && <span className="sig-desc">{sig.description}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="modal-buttons">
              <button className="btn-cancel" onClick={closeDetailsModal}>Fermer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ModerationAnnonces;
