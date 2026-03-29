import { useState } from "react";
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
import "./App.css";

// Navigation items configuration
const navItems = [
  { id: "inbox", label: "Messages", icon: "M" },
  { id: "candidatures", label: "Candidatures", icon: "C" },
  { id: "calendrier", label: "Calendrier", icon: "Ca" },
  { id: "avis", label: "Avis", icon: "A" },
  { id: "profil", label: "Mon Profil", icon: "P" },
  { id: "verification", label: "Verification", icon: "V" },
  { id: "abonnement", label: "Abonnement", icon: "Ab" },
];

const adminNavItems = [
  { id: "users", label: "Utilisateurs", icon: "U" },
  { id: "moderation", label: "Annonces", icon: "Mo" },
  { id: "signalements", label: "Signalements", icon: "S" },
];

function App() {
  const [activeSection, setActiveSection] = useState("inbox");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // ID utilisateur temporaire pour test
  const userId = "6959b0ccbd761ab6803b7f1d";
  const volontaireId = "6959b0d4bd761ab6803b7f20";
  const annonceId = "6959b4b4bd761ab6803b7f3c";

  function handleAvisAdded(avis) {
    console.log("Nouvel avis ajoute:", avis);
  }

  const renderContent = () => {
    switch (activeSection) {
      case "inbox":
        return <Inbox userId={userId} />;
      case "candidatures":
        return <MesCandidatures userId={userId} />;
      case "calendrier":
        return <Calendrier annonceId={annonceId} isHost={true} />;
      case "avis":
        return (
          <div className="avis-section">
            <FormulaireAvis
              authorId={userId}
              targetId={volontaireId}
              onAvisAdded={handleAvisAdded}
            />
            <div className="divider" />
            <ProfilAvis userId={volontaireId} />
          </div>
        );
      case "profil":
        return <ModifierProfil userId={userId} />;
      case "verification":
        return <VerificationIdentite userId={userId} />;
      case "abonnement":
        return <Abonnement userId={userId} />;
      case "users":
        return <GestionUtilisateurs />;
      case "moderation":
        return <ModerationAnnonces />;
      case "signalements":
        return <GestionSignalements />;
      default:
        return <Inbox userId={userId} />;
    }
  };

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarCollapsed ? "collapsed" : ""}`}>
        <div className="sidebar-header">
          <div className="logo">
            <span className="logo-icon">W</span>
            {!sidebarCollapsed && <span className="logo-text">WorkAway</span>}
          </div>
          <button
            className="sidebar-toggle"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            aria-label="Toggle sidebar"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d={sidebarCollapsed ? "M7 4l6 6-6 6" : "M13 4l-6 6 6 6"}
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section">
            {!sidebarCollapsed && <span className="nav-section-title">Menu</span>}
            <ul className="nav-list">
              {navItems.map((item) => (
                <li key={item.id}>
                  <button
                    className={`nav-item ${activeSection === item.id ? "active" : ""}`}
                    onClick={() => setActiveSection(item.id)}
                    title={sidebarCollapsed ? item.label : undefined}
                  >
                    <span className="nav-icon">{item.icon}</span>
                    {!sidebarCollapsed && <span className="nav-label">{item.label}</span>}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="nav-section">
            {!sidebarCollapsed && <span className="nav-section-title">Administration</span>}
            <ul className="nav-list">
              {adminNavItems.map((item) => (
                <li key={item.id}>
                  <button
                    className={`nav-item ${activeSection === item.id ? "active" : ""}`}
                    onClick={() => setActiveSection(item.id)}
                    title={sidebarCollapsed ? item.label : undefined}
                  >
                    <span className="nav-icon">{item.icon}</span>
                    {!sidebarCollapsed && <span className="nav-label">{item.label}</span>}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        <div className="sidebar-footer">
          <div className="user-card">
            <div className="user-avatar">JD</div>
            {!sidebarCollapsed && (
              <div className="user-info">
                <span className="user-name">Jean Dupont</span>
                <span className="user-role">Host</span>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="top-header">
          <div className="header-left">
            <h1 className="page-title">
              {navItems.find((i) => i.id === activeSection)?.label ||
                adminNavItems.find((i) => i.id === activeSection)?.label ||
                "Dashboard"}
            </h1>
          </div>
          <div className="header-right">
            <BadgePremium userId={userId} />
            <NotificationsPanel userId={userId} />
          </div>
        </header>

        <div className="content-area">{renderContent()}</div>
      </main>
    </div>
  );
}

export default App;
