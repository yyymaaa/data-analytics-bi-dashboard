import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect, useState } from 'react';
import Login from "./pages/Login";

function Dashboard() {
  return (
    <div>
      <h2>Welcome to the Data Analytics and BI Dashboard</h2>
      <p>You are now logged in.</p>
    </div>
  );
}

function Home() {
  const [message, setMessage] = useState("");
  useEffect(() => {
    fetch("http://localhost:5000/api/health")
      .then((res) => res.json())
      .then((data) => setMessage(data.status))
      .catch(() => setMessage("Error fetching API"));
  }, []);

  return (
    <div>
      <h1>Data Analytics Dashboard</h1>
      <p>API status: {message}</p>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        {/*Health check page*/}
        <Route path = "/" element={<Home />}/>
        {/*Login page*/}  
        <Route path = "/dashnoard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}



