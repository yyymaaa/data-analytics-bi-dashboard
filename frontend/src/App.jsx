import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";

function Dashboard() {
  return (
    <div>
      <h2>Welcome to the Dashboard</h2>
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

function Unauthorized() {
  return <h2>You are not authorized to view this page</h2>;
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={["admin", "analyst", "viewer"]}>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/unauthorized" element={<Unauthorized />} />
      </Routes>
    </Router>
  );
}
