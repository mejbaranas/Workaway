import { useState } from "react";

function FormulaireAvisHote({ authorId, targetId, onAvisAdded }) {
  const [note, setNote] = useState(5);
  const [commentaire, setCommentaire] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();

    // Verifier le commentaire
    if (!commentaire.trim()) {
      setError("Veuillez ajouter un commentaire");
      return;
    }

    if (commentaire.trim().length < 5) {
      setError("Le commentaire doit contenir au moins 5 caractères");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch("http://localhost:5000/api/avis/hote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          author: authorId,
          target: targetId,
          note,
          commentaire: commentaire.trim()
        })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess("Avis ajouté avec succès !");
        setCommentaire("");
        setNote(5);
        if (onAvisAdded) {
          onAvisAdded(data.avis);
        }
      } else {
        setError(data.message || "Erreur lors de l'ajout");
      }
    } catch {
      setError("Erreur de connexion au serveur");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="formulaire-avis">
      <h3>Évaluer cet hôte</h3>

      {error && <div className="avis-error">{error}</div>}
      {success && <div className="avis-success">{success}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Note :</label>
          <div className="stars-input">
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                className={`star ${star <= note ? "star-filled" : "star-empty"}`}
                onClick={() => setNote(star)}
              >
                ★
              </span>
            ))}
            <span className="note-value">{note}/5</span>
          </div>
        </div>

        <div className="form-group">
          <label>Commentaire :</label>
          <textarea
            value={commentaire}
            onChange={(e) => setCommentaire(e.target.value)}
            placeholder="Décrivez votre expérience avec cet hôte..."
            rows={4}
            required
          />
        </div>

        <button type="submit" className="btn-submit-avis" disabled={loading}>
          {loading ? "Envoi..." : "Envoyer l'avis"}
        </button>
      </form>
    </div>
  );
}

export default FormulaireAvisHote;
