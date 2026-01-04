import { useState, useEffect } from "react";

function MesCandidatures({ userId }) {
  const [candidatures, setCandidatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    fetchCandidatures();
  }, [userId, filterStatus]);

  async function fetchCandidatures() {
    try {
      setLoading(true);
      let url = `http://localhost:5000/api/candidatures/me/${userId}`;
      
      if (filterStatus !== "all") {
        url += `?status=${filterStatus}`;
      }

      const response = await fetch(url);
      const data = await response.json();

      if (response.ok) {
        setCandidatures(data.candidatures || []);
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
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("fr-FR");
  }

  function getStatusLabel(status) {
    switch (status) {
      case "pending":
        return "En attente";
      case "accepted":
        return "Acceptée";
      case "rejected":
        return "Refusée";
      default:
        return status;
    }
  }

  function getStatusClass(status) {
    switch (status) {
      case "pending":
        return "status-pending";
      case "accepted":
        return "status-accepted";
      case "rejected":
        return "status-rejected";
      default:
        return "";
    }
  }

  if (loading) {
    return <div className="candidatures-loading">Chargement...</div>;
  }

  if (error) {
    return <div className="candidatures-error">{error}</div>;
  }

  return (
    <div className="mes-candidatures">
      <h2 className="candidatures-title">Mes candidatures</h2>

      <div className="candidatures-filters">
        <label>Filtrer par statut :</label>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="filter-select"
        >
          <option value="all">Tous</option>
          <option value="pending">En attente</option>
          <option value="accepted">Acceptées</option>
          <option value="rejected">Refusées</option>
        </select>
      </div>

      {candidatures.length === 0 ? (
        <p className="candidatures-empty">Aucune candidature</p>
      ) : (
        <table className="candidatures-table">
          <thead>
            <tr>
              <th>Annonce</th>
              <th>Lieu</th>
              <th>Dates</th>
              <th>Statut</th>
              <th>Réponse de l'hôte</th>
              <th>Date de candidature</th>
            </tr>
          </thead>
          <tbody>
            {candidatures.map((candidature) => (
              <tr key={candidature._id}>
                <td className="candidature-title">
                  {candidature.annonceId ? candidature.annonceId.title : "Annonce supprimée"}
                </td>
                <td>
                  {candidature.annonceId
                    ? `${candidature.annonceId.city}, ${candidature.annonceId.country}`
                    : "-"}
                </td>
                <td>
                  {candidature.annonceId
                    ? `${formatDate(candidature.annonceId.startDate)} - ${formatDate(candidature.annonceId.endDate)}`
                    : "-"}
                </td>
                <td>
                  <span className={`status-badge ${getStatusClass(candidature.status)}`}>
                    {getStatusLabel(candidature.status)}
                  </span>
                </td>
                <td className="host-response">
                  {candidature.hostResponse || "-"}
                </td>
                <td>{formatDate(candidature.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default MesCandidatures;
