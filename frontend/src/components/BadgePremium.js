import React, { useState, useEffect } from "react";
import "./BadgePremium.css";

function BadgePremium({ userId }) {
  // États
  const [isPremium, setIsPremium] = useState(false);
  const [plan, setPlan] = useState("gratuit");
  const [premiumUntil, setPremiumUntil] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDetails, setShowDetails] = useState(false);

  // Charger le statut premium
  useEffect(() => {
    if (userId) {
      chargerStatut();
    }
  }, [userId]);

  // Fonction pour charger le statut
  const chargerStatut = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/payments/status/${userId}`);
      const data = await response.json();

      if (response.ok) {
        setIsPremium(data.isPremium);
        setPlan(data.plan || "gratuit");
        setPremiumUntil(data.premiumUntil);
      }
    } catch (error) {
      console.error("Erreur chargement statut premium:", error);
    } finally {
      setLoading(false);
    }
  };

  // Formater la date
  const formaterDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });
  };

  // Obtenir le libellé du plan
  const getLibellePlan = () => {
    switch (plan) {
      case "mensuel":
        return "Premium Mensuel";
      case "annuel":
        return "Premium Annuel";
      default:
        return "Gratuit";
    }
  };

  // Ne rien afficher si en chargement
  if (loading) {
    return null;
  }

  // Ne pas afficher de badge si pas premium
  if (!isPremium) {
    return (
      <div className="badge-premium-container">
        <span className="badge-gratuit">
          <span className="badge-icon">👤</span>
          Gratuit
        </span>
      </div>
    );
  }

  // Afficher le badge premium
  return (
    <div className="badge-premium-container">
      <button
        className={`badge-premium ${plan}`}
        onClick={() => setShowDetails(!showDetails)}
        title="Cliquez pour voir les détails"
      >
        <span className="badge-icon">⭐</span>
        <span className="badge-text">Premium</span>
        {plan === "annuel" && <span className="badge-annuel">PRO</span>}
      </button>

      {/* Popup détails */}
      {showDetails && (
        <div className="badge-details-popup">
          <div className="badge-details-header">
            <span className="details-icon">👑</span>
            <h4>Votre abonnement</h4>
          </div>
          
          <div className="badge-details-content">
            <div className="detail-row">
              <span className="detail-label">Plan :</span>
              <span className="detail-value">{getLibellePlan()}</span>
            </div>
            
            <div className="detail-row">
              <span className="detail-label">Statut :</span>
              <span className="detail-value statut-actif">Actif</span>
            </div>
            
            {premiumUntil && (
              <div className="detail-row">
                <span className="detail-label">Valide jusqu'au :</span>
                <span className="detail-value">{formaterDate(premiumUntil)}</span>
              </div>
            )}
          </div>

          <div className="badge-details-footer">
            <a href="/abonnement" className="lien-gerer">
              Gérer mon abonnement →
            </a>
          </div>
        </div>
      )}

      {/* Overlay pour fermer */}
      {showDetails && (
        <div 
          className="badge-overlay" 
          onClick={() => setShowDetails(false)}
        />
      )}
    </div>
  );
}

export default BadgePremium;
