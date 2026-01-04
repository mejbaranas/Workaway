import Inbox from "./components/Inbox";
import "./components/Inbox.css";
import MesCandidatures from "./components/MesCandidatures";
import "./components/MesCandidatures.css";

function App() {
  // ID utilisateur temporaire pour test (à remplacer par l'utilisateur connecté)
  const userId = "6959b0ccbd761ab6803b7f1d";

  return (
    <div className="app">
      <h1>WorkAway</h1>
      <MesCandidatures userId={userId} />
      <hr style={{ margin: "40px 0" }} />
      <Inbox userId={userId} />
    </div>
  );
}

export default App;
