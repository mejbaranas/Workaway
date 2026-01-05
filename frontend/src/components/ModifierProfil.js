import { useState, useEffect } from "react";

function ModifierProfil({ userId }) {
  // États pour les données du profil
  const [bio, setBio] = useState("");
  const [langues, setLangues] = useState([]);
  const [competences, setCompetences] = useState([]);
  const [photo, setPhoto] = useState("");

  // États pour les inputs
  const [nouvelleLangue, setNouvelleLangue] = useState("");
  const [nouvelleCompetence, setNouvelleCompetence] = useState("");

  // États pour le chargement et les messages
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Charger le profil au démarrage
  useEffect(() => {
    fetchProfile();
  }, [userId]);

  // Récupérer les données du profil
  async function fetchProfile() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`http://localhost:5000/api/profile/${userId}`);
      const data = await response.json();

      if (response.ok) {
        setBio(data.user.bio || "");
        setLangues(data.user.langues || []);
        setCompetences(data.user.competences || []);
        setPhoto(data.user.photo || "");
      } else {
        setError(data.message || "Erreur lors du chargement");
      }
    } catch {
      setError("Erreur de connexion au serveur");
    } finally {
      setLoading(false);
    }
  }

  // Sauvegarder le profil
  async function handleSave() {
    try {
      setSaving(true);
      setMessage("");
      setError("");

      const response = await fetch(`http://localhost:5000/api/profile/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          bio: bio,
          langues: langues,
          competences: competences
        })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("Profil mis à jour avec succès !");
      } else {
        setError(data.message || "Erreur lors de la sauvegarde");
      }
    } catch {
      setError("Erreur de connexion au serveur");
    } finally {
      setSaving(false);
    }
  }

  // Uploader une photo
  async function handlePhotoUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    // Vérifier le type de fichier
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      setError("Type de fichier non autorisé. Utilisez JPG, PNG ou GIF.");
      return;
    }

    // Vérifier la taille (max 5 MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("La photo ne doit pas dépasser 5 MB.");
      return;
    }

    try {
      setSaving(true);
      setMessage("");
      setError("");

      const formData = new FormData();
      formData.append("photo", file);

      const response = await fetch(`http://localhost:5000/api/profile/${userId}/photo`, {
        method: "POST",
        body: formData
      });

      const data = await response.json();

      if (response.ok) {
        setPhoto(data.photo);
        setMessage("Photo mise à jour avec succès !");
      } else {
        setError(data.message || "Erreur lors de l'upload");
      }
    } catch {
      setError("Erreur de connexion au serveur");
    } finally {
      setSaving(false);
    }
  }

  // Ajouter une langue
  function ajouterLangue() {
    if (nouvelleLangue.trim() === "") return;
    if (langues.includes(nouvelleLangue.trim())) {
      setError("Cette langue existe déjà");
      return;
    }
    setLangues([...langues, nouvelleLangue.trim()]);
    setNouvelleLangue("");
    setError("");
  }

  // Supprimer une langue
  function supprimerLangue(index) {
    const nouvellesLangues = langues.filter((_, i) => i !== index);
    setLangues(nouvellesLangues);
  }

  // Ajouter une compétence
  function ajouterCompetence() {
    if (nouvelleCompetence.trim() === "") return;
    if (competences.includes(nouvelleCompetence.trim())) {
      setError("Cette compétence existe déjà");
      return;
    }
    setCompetences([...competences, nouvelleCompetence.trim()]);
    setNouvelleCompetence("");
    setError("");
  }

  // Supprimer une compétence
  function supprimerCompetence(index) {
    const nouvellesCompetences = competences.filter((_, i) => i !== index);
    setCompetences(nouvellesCompetences);
  }

  // Affichage du chargement
  if (loading) {
    return <div className="profil-loading">Chargement du profil...</div>;
  }

  return (
    <div className="modifier-profil">
      <h2 className="profil-title">Modifier mon profil</h2>

      {/* Messages */}
      {message && <div className="profil-success">{message}</div>}
      {error && <div className="profil-error">{error}</div>}

      {/* Photo de profil */}
      <div className="profil-section">
        <h3>Photo de profil</h3>
        <div className="photo-container">
          {photo ? (
            <img 
              src={`http://localhost:5000${photo}`} 
              alt="Photo de profil" 
              className="photo-preview"
            />
          ) : (
            <div className="photo-placeholder">Pas de photo</div>
          )}
          <label className="photo-upload-btn">
            Changer la photo
            <input 
              type="file" 
              accept="image/jpeg,image/jpg,image/png,image/gif"
              onChange={handlePhotoUpload}
              hidden
            />
          </label>
        </div>
      </div>

      {/* Bio */}
      <div className="profil-section">
        <h3>Bio</h3>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Décrivez-vous en quelques mots..."
          className="profil-textarea"
          maxLength={500}
          rows={4}
        />
        <div className="char-count">{bio.length}/500 caractères</div>
      </div>

      {/* Langues */}
      <div className="profil-section">
        <h3>Langues parlées</h3>
        <div className="tags-container">
          {langues.map((langue, index) => (
            <span key={index} className="tag">
              {langue}
              <button 
                type="button" 
                className="tag-remove"
                onClick={() => supprimerLangue(index)}
              >
                ×
              </button>
            </span>
          ))}
        </div>
        <div className="add-tag-container">
          <input
            type="text"
            value={nouvelleLangue}
            onChange={(e) => setNouvelleLangue(e.target.value)}
            placeholder="Ajouter une langue"
            className="profil-input"
            onKeyPress={(e) => e.key === "Enter" && ajouterLangue()}
          />
          <button type="button" className="add-btn" onClick={ajouterLangue}>
            Ajouter
          </button>
        </div>
      </div>

      {/* Compétences */}
      <div className="profil-section">
        <h3>Compétences</h3>
        <div className="tags-container">
          {competences.map((competence, index) => (
            <span key={index} className="tag">
              {competence}
              <button 
                type="button" 
                className="tag-remove"
                onClick={() => supprimerCompetence(index)}
              >
                ×
              </button>
            </span>
          ))}
        </div>
        <div className="add-tag-container">
          <input
            type="text"
            value={nouvelleCompetence}
            onChange={(e) => setNouvelleCompetence(e.target.value)}
            placeholder="Ajouter une compétence"
            className="profil-input"
            onKeyPress={(e) => e.key === "Enter" && ajouterCompetence()}
          />
          <button type="button" className="add-btn" onClick={ajouterCompetence}>
            Ajouter
          </button>
        </div>
      </div>

      {/* Bouton Sauvegarder */}
      <button 
        type="button" 
        className="save-btn"
        onClick={handleSave}
        disabled={saving}
      >
        {saving ? "Sauvegarde en cours..." : "Sauvegarder le profil"}
      </button>
    </div>
  );
}

export default ModifierProfil;
