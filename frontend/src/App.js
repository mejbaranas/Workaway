import Inbox from "./components/Inbox";
import "./components/Inbox.css";
import MesCandidatures from "./components/MesCandidatures";
import "./components/MesCandidatures.css";
import Calendrier from "./components/Calendrier";
import "./components/Calendrier.css";
import FormulaireAvis from "./components/FormulaireAvis";
import ProfilAvis from "./components/ProfilAvis";
import "./components/Avis.css";
import ModifierProfil from "./components/ModifierProfil";
import "./components/ModifierProfil.css";
import VerificationIdentite from "./components/VerificationIdentite";
import "./components/VerificationIdentite.css";
import GestionUtilisateurs from "./components/GestionUtilisateurs";
import "./components/GestionUtilisateurs.css";
import ModerationAnnonces from "./components/ModerationAnnonces";
import "./components/ModerationAnnonces.css";
import GestionSignalements from "./components/GestionSignalements";
import "./components/GestionSignalements.css";
import NotificationsPanel from "./components/NotificationsPanel";
import "./components/NotificationsPanel.css";
import Abonnement from "./components/Abonnement";
import "./components/Abonnement.css";
import BadgePremium from "./components/BadgePremium";
import "./components/BadgePremium.css";

function App() {
  // ID utilisateur temporaire pour test (à remplacer par l'utilisateur connecté)
  const userId = "6959b0ccbd761ab6803b7f1d"; // Hôte qui donne l'avis
  // ID du volontaire à évaluer
  const volontaireId = "6959b0d4bd761ab6803b7f20"; // Marie Dupont
  // ID annonce temporaire pour test
  const annonceId = "6959b4b4bd761ab6803b7f3c";

  function handleAvisAdded(avis) {
    console.log("Nouvel avis ajouté:", avis);
    // Recharger les avis si nécessaire
  }

  return (
    <div className="app">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>WorkAway</h1>
        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
          <BadgePremium userId={userId} />
          <NotificationsPanel userId={userId} />
        </div>
      </div>
      
      <h2 style={{ marginTop: "30px" }}>👨‍💼 Gestion des utilisateurs (Admin)</h2>
      <GestionUtilisateurs />
      
      <hr style={{ margin: "40px 0" }} />
      
      <h2 style={{ marginTop: "30px" }}>📋 Modération des annonces (Admin)</h2>
      <ModerationAnnonces />
      
      <hr style={{ margin: "40px 0" }} />
      
      <h2 style={{ marginTop: "30px" }}>🚨 Gestion des signalements (Admin)</h2>
      <GestionSignalements />
      
      <hr style={{ margin: "40px 0" }} />
      
      <h2 style={{ marginTop: "30px" }}>💳 Abonnement Premium</h2>
      <Abonnement userId={userId} />
      
      <hr style={{ margin: "40px 0" }} />
      
      <h2 style={{ marginTop: "30px" }}>Modifier mon profil</h2>
      <ModifierProfil userId={userId} />
      
      <hr style={{ margin: "40px 0" }} />
      
      <h2 style={{ marginTop: "30px" }}>Vérification d'identité</h2>
      <VerificationIdentite userId={userId} />
      
      <hr style={{ margin: "40px 0" }} />
      
      <h2 style={{ marginTop: "30px" }}>US4 - Évaluer un volontaire</h2>
      <FormulaireAvis 
        authorId={userId} 
        targetId={volontaireId} 
        onAvisAdded={handleAvisAdded} 
      />
      <hr style={{ margin: "40px 0" }} />
      <ProfilAvis userId={volontaireId} />
      
      <hr style={{ margin: "40px 0" }} />
      <Calendrier annonceId={annonceId} isHost={true} />
      <hr style={{ margin: "40px 0" }} />
      <MesCandidatures userId={userId} />
      <hr style={{ margin: "40px 0" }} />
      <Inbox userId={userId} />
    </div>
  );
}

export default App;