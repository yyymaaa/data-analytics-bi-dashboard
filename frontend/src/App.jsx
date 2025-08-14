import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import ProtectedRoute from "./components/ProtectedRoute";
// Import pages
import Login from "./pages/Login";
import RegisterPage from "./pages/RegisterPage";
import VerifyPage from "./pages/VerifyPage";

// Dashboard Page
function DashboardPage() {
  return (
    <div style={styles.pageContent}>
      <h2 style={styles.title}>Welcome to the Dashboard</h2>
      <p style={styles.subtitle}>You are now logged in.</p>
    </div>
  );
}

// Home Page
function HomePage() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("http://localhost:5000/api/health")
      .then((res) => res.json())
      .then((data) => setMessage(data.status))
      .catch(() => setMessage("Error fetching API"));
  }, []);

  return (
    <div style={styles.pageContent}>
      <h1 style={styles.title}>Data Analytics Dashboard</h1>
      <p style={styles.subtitle}>
        API status: <span style={styles.neonAnimated}>{message}</span>
      </p>
    </div>
  );
}

// Unauthorized Page
function Unauthorized() {
  return (
    <div style={styles.pageContent}>
      <h2 style={styles.title}>You are not authorized to view this page</h2>
    </div>
  );
}

// Navigation Bar
function NavBar() {
  return (
    <nav style={styles.navBar}>
      <Link to="/" style={styles.navLink}>Home</Link>
      <Link to="/login" style={styles.navLink}>Login</Link>
      <Link to="/register" style={styles.navLink}>Register</Link>
      <Link to="/dashboard" style={styles.navLink}>Dashboard</Link>
    </nav>
  );
}

// App Component
export default function App() {
  return (
    <div style={styles.appContainer}>
      <Router>
        <NavBar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify" element={<VerifyPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={["admin", "analyst", "viewer"]}>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route path="/unauthorized" element={<Unauthorized />} />
        </Routes>
      </Router>
    </div>
  );
}

// Styles
const styles = {
  appContainer: {
    backgroundColor: "#0e0e12",
    minHeight: "100vh",
    color: "#00ff80",
    fontFamily: "'Fira Code', monospace, 'Courier New'",
    margin: 0,
    padding: 0,
    width: "100vw", // Ensures full viewport width
    overflowX: "hidden", // Prevents horizontal scroll
  },
  pageContent: {
    padding: "20px",
    textAlign: "center",
    width: "100%", // Takes full width
    boxSizing: "border-box", // Includes padding in width calculation
  },
  title: {
    fontSize: "2rem",
    fontWeight: "600",
    textShadow: "0 0 10px #00ff80",
    marginBottom: "1rem",
    width: "100%", // Ensures full width
  },
  subtitle: {
    fontSize: "1.2rem",
    color: "#00ff80",
    width: "100%", // Ensures full width
  },
  neonAnimated: {
    color: "#00ff80",
    textShadow: "0 0 10px #00ff80",
    fontWeight: "600",
    animation: "pulse 1.5s infinite",
  },
  navBar: {
    backgroundColor: "#18181d",
    padding: "15px 20px",
    display: "flex",
    justifyContent: "center",
    gap: "20px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.5)",
    width: "100%", // Takes full width
    boxSizing: "border-box", // Includes padding in width calculation
  },
  navLink: {
    color: "#00ff80",
    textDecoration: "none",
    fontFamily: "'Fira Code', monospace, 'Courier New'",
    fontWeight: "500",
    transition: "all 0.3s ease",
    padding: "5px 10px",
    borderRadius: "4px",
  },
  "@keyframes pulse": {
    "0%": { opacity: 0.8, textShadow: "0 0 5px #00ff80" },
    "50%": { opacity: 1, textShadow: "0 0 15px #00ff80" },
    "100%": { opacity: 0.8, textShadow: "0 0 5px #00ff80" },
  },
};

// Add this to your main CSS file or index.html
// body { margin: 0; padding: 0; font-family: 'Fira Code', monospace; }