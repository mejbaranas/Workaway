import { useState, useEffect } from "react";

function VerificationIdentite({ userId }) {
  // États pour les données
  const [verificationStatus, setVerificationStatus] = useState("non_soumis");
  const [isVerified, setIsVerified] = useState(false);
  const [hasDocument, setHasDocument] = useState(false);
  const [verificationDate, setVerificationDate] = useState(null);

  // États pour le chargement et les messages
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Charger le statut au démarrage
  useEffect(() => {
    fetchStatus();
  }, [userId]);

  // Récupérer le statut de vérification
  async function fetchStatus() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`http://localhost:5000/api/verification/${userId}/status`);
      const data = await response.json();

      if (response.ok) {
        setVerificationStatus(data.verificationStatus);
        setIsVerified(data.isVerified);
        setHasDocument(data.hasDocument);
        setVerificationDate(data.verificationDate);
      } else {
        setError(data.message || "Erreur lors du chargement");
      }
    } catch {
      setError("Erreur de connexion au serveur");
    } finally {
      setLoading(false);
    }
  }

  // Uploader un document
  async function handleUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    // Vérifier le type de fichier
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "application/pdf"];
    if (!allowedTypes.includes(file.type)) {
      setError("Type de fichier non autorisé. Utilisez JPG, PNG ou PDF.");
      return;
    }

    // Vérifier la taille (max 10 MB)
    if (file.size > 10 * 1024 * 1024) {
      setError("Le fichier ne doit pas dépasser 10 MB.");
      return;
    }

    try {
      setUploading(true);
      setMessage("");
      setError("");

      const formData = new FormData();
      formData.append("document", file);

      const response = await fetch(`http://localhost:5000/api/verification/${userId}/upload`, {
        method: "POST",
        body: formData
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);
        setVerificationStatus("en_attente");
        setHasDocument(true);
      } else {
        setError(data.message || "Erreur lors de l'upload");
      }
    } catch {
      setError("Erreur de connexion au serveur");
    } finally {
      setUploading(false);
    }
  }

  // Afficher le badge de statut
  function getStatusBadge() {
    switch (verificationStatus) {
      case "non_soumis":
        return <span className="status-badge status-non-soumis">Non vérifié</span>;
      case "en_attente":
        return <span className="status-badge status-en-attente">En attente</span>;
      case "verifie":
        return <span className="status-badge status-verifie">✓ Vérifié</span>;
      case "refuse":
        return <span className="status-badge status-refuse">Refusé</span>;
      default:
        return null;
    }
  }

  // Afficher l'icône de statut
  function getStatusIcon() {
    switch (verificationStatus) {
      case "non_soumis":
        return "🔒";
      case "en_attente":
        return "⏳";
      case "verifie":
        return "✅";
      case "refuse":
        return "❌";
      default:
        return "🔒";
    }
  }

  // Formater la date
  function formatDate(dateString) {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });
  }

  // Affichage du chargement
  if (loading) {
    return <div className="verification-loading">Chargement...</div>;
  }

  return (
    <div className="verification-identite">
      <h2 className="verification-title">Vérification d'identité</h2>

      {/* Messages */}
      {message && <div className="verification-success">{message}</div>}
      {error && <div className="verification-error">{error}</div>}

      {/* Carte de statut */}
      <div className="verification-card">
        <div className="verification-header">
          <span className="verification-icon">{getStatusIcon()}</span>
          <div className="verification-info">
            <h3>Statut de vérification</h3>
            {getStatusBadge()}
          </div>
        </div>

        {/* Message selon le statut */}
        <div className="verification-message">
          {verificationStatus === "non_soumis" && (
            <p>Votre identité n'a pas encore été vérifiée. Soumettez un document d'identité pour obtenir le badge vérifié.</p>
          )}
          {verificationStatus === "en_attente" && (
            <p>Votre document est en cours de vérification. Vous serez notifié une fois la vérification terminée.</p>
          )}
          {verificationStatus === "verifie" && (
            <p>Votre identité a été vérifiée le {formatDate(verificationDate)}. Vous avez maintenant le badge vérifié sur votre profil.</p>
          )}
          {verificationStatus === "refuse" && (
            <p>Votre document a été refusé. Veuillez soumettre un nouveau document valide.</p>
          )}
        </div>

        {/* Zone d'upload */}
        {(verificationStatus === "non_soumis" || verificationStatus === "refuse") && (
          <div className="upload-section">
            <h4>Soumettre un document d'identité</h4>
            <p className="upload-info">
              Formats acceptés : JPG, PNG, PDF (max 10 MB)<br />
              Documents acceptés : Carte d'identité, Passeport, Permis de conduire
            </p>
            <label className="upload-btn">
              {uploading ? "Upload en cours..." : "Choisir un fichier"}
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png,application/pdf"
                onChange={handleUpload}
                disabled={uploading}
                hidden
              />
            </label>
          </div>
        )}

        {/* Avantages de la vérification */}
        <div className="verification-avantages">
          <h4>Avantages d'un profil vérifié</h4>
          <ul>
            <li>✓ Badge de confiance sur votre profil</li>
            <li>✓ Plus de visibilité auprès des hôtes</li>
            <li>✓ Accès prioritaire aux annonces</li>
            <li>✓ Meilleure crédibilité</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default VerificationIdentite;
