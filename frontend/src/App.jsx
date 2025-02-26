import { useEffect, useState } from "react";

function App() {
  const [data, setData] = useState("");

  useEffect(() => {
    fetch("/api/data") // Call Flask API
      .then((res) => res.json())
      .then((data) => setData(data.message));
  }, []);

  return (
    <div>
      <h1>Flask + React Integration</h1>
      <p>{data}</p>
    </div>
  );
}

export default App;
