import { useState, useEffect } from "react";

function GestionUtilisateurs() {
  // États pour les données
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // États pour le modal de modification
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editForm, setEditForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    role: "user"
  });

  // États pour le modal de suspension
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [suspendReason, setSuspendReason] = useState("");

  // Charger les utilisateurs au démarrage
  useEffect(() => {
    fetchUsers();
  }, []);

  // Récupérer tous les utilisateurs
  async function fetchUsers() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("http://localhost:5000/api/admin/users");
      const data = await response.json();

      if (response.ok) {
        setUsers(data.users || []);
      } else {
        setError(data.message || "Erreur lors du chargement");
      }
    } catch {
      setError("Erreur de connexion au serveur");
    } finally {
      setLoading(false);
    }
  }

  // Ouvrir le modal de modification
  function openEditModal(user) {
    setSelectedUser(user);
    setEditForm({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role || "user"
    });
    setShowModal(true);
  }

  // Fermer le modal de modification
  function closeEditModal() {
    setShowModal(false);
    setSelectedUser(null);
  }

  // Mettre à jour un utilisateur
  async function handleUpdate() {
    try {
      setMessage("");
      setError("");

      const response = await fetch(`http://localhost:5000/api/admin/users/${selectedUser._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(editForm)
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("Utilisateur mis à jour avec succès");
        closeEditModal();
        fetchUsers(); // Recharger la liste
      } else {
        setError(data.message || "Erreur lors de la mise à jour");
      }
    } catch {
      setError("Erreur de connexion au serveur");
    }
  }

  // Ouvrir le modal de suspension
  function openSuspendModal(user) {
    setSelectedUser(user);
    setSuspendReason("");
    setShowSuspendModal(true);
  }

  // Fermer le modal de suspension
  function closeSuspendModal() {
    setShowSuspendModal(false);
    setSelectedUser(null);
    setSuspendReason("");
  }

  // Suspendre un utilisateur
  async function handleSuspend() {
    try {
      setMessage("");
      setError("");

      const response = await fetch(`http://localhost:5000/api/admin/users/${selectedUser._id}/suspend`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ reason: suspendReason })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("Compte suspendu avec succès");
        closeSuspendModal();
        fetchUsers();
      } else {
        setError(data.message || "Erreur lors de la suspension");
      }
    } catch {
      setError("Erreur de connexion au serveur");
    }
  }

  // Réactiver un utilisateur
  async function handleUnsuspend(userId) {
    try {
      setMessage("");
      setError("");

      const response = await fetch(`http://localhost:5000/api/admin/users/${userId}/unsuspend`, {
        method: "PUT"
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("Compte réactivé avec succès");
        fetchUsers();
      } else {
        setError(data.message || "Erreur lors de la réactivation");
      }
    } catch {
      setError("Erreur de connexion au serveur");
    }
  }

  // Supprimer un utilisateur
  async function handleDelete(userId) {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ?")) {
      return;
    }

    try {
      setMessage("");
      setError("");

      const response = await fetch(`http://localhost:5000/api/admin/users/${userId}`, {
        method: "DELETE"
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("Utilisateur supprimé avec succès");
        fetchUsers();
      } else {
        setError(data.message || "Erreur lors de la suppression");
      }
    } catch {
      setError("Erreur de connexion au serveur");
    }
  }

  // Formater la date
  function formatDate(dateString) {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("fr-FR");
  }

  // Affichage du chargement
  if (loading) {
    return <div className="admin-loading">Chargement des utilisateurs...</div>;
  }

  return (
    <div className="gestion-utilisateurs">
      <h2 className="admin-title">Gestion des utilisateurs</h2>

      {/* Messages */}
      {message && <div className="admin-success">{message}</div>}
      {error && <div className="admin-error">{error}</div>}

      {/* Statistiques */}
      <div className="admin-stats">
        <div className="stat-card">
          <span className="stat-number">{users.length}</span>
          <span className="stat-label">Total utilisateurs</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{users.filter(u => u.isVerified).length}</span>
          <span className="stat-label">Vérifiés</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{users.filter(u => u.isSuspended).length}</span>
          <span className="stat-label">Suspendus</span>
        </div>
      </div>

      {/* Tableau des utilisateurs */}
      <div className="table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Nom</th>
              <th>Email</th>
              <th>Rôle</th>
              <th>Statut</th>
              <th>Vérifié</th>
              <th>Inscrit le</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id} className={user.isSuspended ? "row-suspended" : ""}>
                <td>
                  <div className="user-name">
                    {user.photo ? (
                      <img src={`http://localhost:5000${user.photo}`} alt="" className="user-avatar" />
                    ) : (
                      <div className="user-avatar-placeholder">
                        {user.firstName.charAt(0)}
                      </div>
                    )}
                    <span>{user.firstName} {user.lastName}</span>
                  </div>
                </td>
                <td>{user.email}</td>
                <td>
                  <span className={`role-badge ${user.role === "admin" ? "role-admin" : "role-user"}`}>
                    {user.role === "admin" ? "Admin" : "Utilisateur"}
                  </span>
                </td>
                <td>
                  {user.isSuspended ? (
                    <span className="status-badge status-suspended">Suspendu</span>
                  ) : (
                    <span className="status-badge status-active">Actif</span>
                  )}
                </td>
                <td>
                  {user.isVerified ? (
                    <span className="verified-badge">✓ Vérifié</span>
                  ) : (
                    <span className="not-verified">Non vérifié</span>
                  )}
                </td>
                <td>{formatDate(user.createdAt)}</td>
                <td>
                  <div className="action-buttons">
                    <button 
                      className="btn-edit"
                      onClick={() => openEditModal(user)}
                    >
                      Modifier
                    </button>
                    {user.isSuspended ? (
                      <button 
                        className="btn-unsuspend"
                        onClick={() => handleUnsuspend(user._id)}
                      >
                        Réactiver
                      </button>
                    ) : (
                      <button 
                        className="btn-suspend"
                        onClick={() => openSuspendModal(user)}
                      >
                        Suspendre
                      </button>
                    )}
                    <button 
                      className="btn-delete"
                      onClick={() => handleDelete(user._id)}
                    >
                      Supprimer
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal de modification */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Modifier l'utilisateur</h3>
            <div className="form-group">
              <label>Prénom</label>
              <input
                type="text"
                value={editForm.firstName}
                onChange={(e) => setEditForm({...editForm, firstName: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Nom</label>
              <input
                type="text"
                value={editForm.lastName}
                onChange={(e) => setEditForm({...editForm, lastName: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm({...editForm, email: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Rôle</label>
              <select
                value={editForm.role}
                onChange={(e) => setEditForm({...editForm, role: e.target.value})}
              >
                <option value="user">Utilisateur</option>
                <option value="admin">Administrateur</option>
              </select>
            </div>
            <div className="modal-buttons">
              <button className="btn-cancel" onClick={closeEditModal}>Annuler</button>
              <button className="btn-save" onClick={handleUpdate}>Enregistrer</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de suspension */}
      {showSuspendModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Suspendre le compte</h3>
            <p>Vous allez suspendre le compte de <strong>{selectedUser?.firstName} {selectedUser?.lastName}</strong></p>
            <div className="form-group">
              <label>Raison de la suspension</label>
              <textarea
                value={suspendReason}
                onChange={(e) => setSuspendReason(e.target.value)}
                placeholder="Entrez la raison de la suspension..."
                rows={3}
              />
            </div>
            <div className="modal-buttons">
              <button className="btn-cancel" onClick={closeSuspendModal}>Annuler</button>
              <button className="btn-suspend" onClick={handleSuspend}>Suspendre</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default GestionUtilisateurs;
