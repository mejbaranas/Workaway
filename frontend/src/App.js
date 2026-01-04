import Inbox from "./components/Inbox";
import "./components/Inbox.css";
import MesCandidatures from "./components/MesCandidatures";
import "./components/MesCandidatures.css";
import Calendrier from "./components/Calendrier";
import "./components/Calendrier.css";

function App() {
  // ID utilisateur temporaire pour test (à remplacer par l'utilisateur connecté)
  const userId = "6959b0ccbd761ab6803b7f1d";
  // ID annonce temporaire pour test
  const annonceId = "6959b4b4bd761ab6803b7f3c";

  return (
    <div className="app">
      <h1>WorkAway</h1>
      <Calendrier annonceId={annonceId} isHost={true} />
      <hr style={{ margin: "40px 0" }} />
      <MesCandidatures userId={userId} />
      <hr style={{ margin: "40px 0" }} />
      <Inbox userId={userId} />
    </div>
  );
}

export default App;
