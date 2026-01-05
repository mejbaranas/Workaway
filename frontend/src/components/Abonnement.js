import React, { useState, useEffect } from "react";
import "./Abonnement.css";

function Abonnement({ userId }) {
  const [plans, setPlans] = useState([]);
  const [currentStatus, setCurrentStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Charger les plans disponibles
  async function chargerPlans() {
    try {
      const response = await fetch("http://localhost:5000/api/payments/plans");
      const data = await response.json();
      setPlans(data.plans || []);
    } catch {
      console.log("Erreur lors du chargement des plans");
    }
  }

  // Charger le statut d'abonnement
  async function chargerStatut() {
    try {
      const response = await fetch(
        `http://localhost:5000/api/payments/status/${userId}`
      );
      const data = await response.json();
      setCurrentStatus(data);
    } catch {
      console.log("Erreur lors du chargement du statut");
    }
  }

  useEffect(() => {
    chargerPlans();
    if (userId) {
      chargerStatut();
    }
  }, [userId]);

  // Gérer le paiement
  async function handlePaiement(planId) {
    if (planId === "gratuit") return;

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(
        "http://localhost:5000/api/payments/create-checkout",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: userId,
            plan: planId
          })
        }
      );
      const data = await response.json();

      if (data.url) {
        // Rediriger vers Stripe Checkout
        window.location.href = data.url;
      } else {
        setMessage("Erreur: " + (data.message || "Impossible de créer le paiement"));
      }
    } catch {
      setMessage("Erreur lors de la connexion au serveur");
    }
    setLoading(false);
  }

  // Annuler l'abonnement
  async function handleAnnuler() {
    if (!window.confirm("Voulez-vous vraiment annuler votre abonnement ?")) return;

    setLoading(true);
    try {
      const response = await fetch(
        "http://localhost:5000/api/payments/cancel",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: userId })
        }
      );
      const data = await response.json();
      setMessage(data.message);
      chargerStatut();
    } catch {
      setMessage("Erreur lors de l'annulation");
    }
    setLoading(false);
  }

  // Formater la date
  function formatDate(dateString) {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric"
    });
  }

  return (
    <div className="abonnement-container">
      <h2>Choisissez votre abonnement</h2>

      {message && (
        <div className="abonnement-message">
          {message}
          <button onClick={() => setMessage("")}>×</button>
        </div>
      )}

      {/* Statut actuel */}
      {currentStatus && currentStatus.isPremium && (
        <div className="statut-actuel">
          <div className="statut-badge premium">
            <span className="statut-icon">⭐</span>
            <span>Premium {currentStatus.plan}</span>
          </div>
          <p>Votre abonnement est actif jusqu'au {formatDate(currentStatus.premiumUntil)}</p>
          <button className="btn-annuler" onClick={handleAnnuler} disabled={loading}>
            Annuler l'abonnement
          </button>
        </div>
      )}

      {/* Cartes des plans */}
      <div className="plans-grid">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`plan-card ${plan.id === "annuel" ? "popular" : ""} ${
              currentStatus?.plan === plan.id ? "current" : ""
            }`}
          >
            {plan.id === "annuel" && (
              <div className="plan-badge">Le plus populaire</div>
            )}
            {plan.savings && <div className="plan-savings">{plan.savings}</div>}

            <h3 className="plan-name">{plan.name}</h3>

            <div className="plan-price">
              <span className="price-amount">
                {plan.price === 0 ? "Gratuit" : `${plan.price}€`}
              </span>
              {plan.duration && (
                <span className="price-duration">/{plan.duration}</span>
              )}
            </div>

            <ul className="plan-features">
              {plan.features.map((feature, index) => (
                <li key={index}>
                  <span className="feature-check">✓</span>
                  {feature}
                </li>
              ))}
            </ul>

            {plan.id === "gratuit" ? (
              <button className="btn-plan btn-gratuit" disabled>
                Plan actuel
              </button>
            ) : currentStatus?.plan === plan.id ? (
              <button className="btn-plan btn-current" disabled>
                Votre plan actuel
              </button>
            ) : (
              <button
                className="btn-plan btn-upgrade"
                onClick={() => handlePaiement(plan.id)}
                disabled={loading}
              >
                {loading ? "Chargement..." : "Choisir ce plan"}
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Historique des abonnements */}
      {currentStatus?.subscriptions && currentStatus.subscriptions.length > 0 && (
        <div className="historique-section">
          <h3>Historique des paiements</h3>
          <table className="historique-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Plan</th>
                <th>Montant</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              {currentStatus.subscriptions.map((sub) => (
                <tr key={sub._id}>
                  <td>{formatDate(sub.createdAt)}</td>
                  <td>{sub.plan}</td>
                  <td>{(sub.amount / 100).toFixed(2)}€</td>
                  <td>
                    <span className={`statut-tag ${sub.status}`}>
                      {sub.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Informations de sécurité */}
      <div className="securite-info">
        <p>
          🔒 Paiement sécurisé par <strong>Stripe</strong>
        </p>
        <p>Vos informations bancaires ne sont jamais stockées sur nos serveurs.</p>
      </div>
    </div>
  );
}

export default Abonnement;
