import { useEffect } from "react";

function App() {
  useEffect(() => {
    fetch("http://localhost:5000/api/hello")
      .then(res => res.json())
      .then(data => console.log("FROM BACKEND:", data))
      .catch(err => console.error("ERROR:", err));
  }, []);

  return <h1>Frontend React</h1>;
}

export default App;
