import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import ProtectedRoute from "./components/ProtectedRoute";
import RegisterPage from "./pages/RegisterPage";
import VerifyPage from "./pages/VerifyPage";

// Login Page
function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    }
  };

  return (
    <div>
      <h2>Login</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleLogin}>
        <input 
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        /><br />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        /><br />
        <button type="submit">Login</button>
      </form>
    </div>
  );
}

// Dashboard Page
function DashboardPage() {
  return (
    <div>
      <h2>Welcome to the Dashboard</h2>
      <p>You are now logged in.</p>
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
    <div>
      <h1>Data Analytics Dashboard</h1>
      <p>API status: {message}</p>
    </div>
  );
}

// Unauthorized Page
function Unauthorized() {
  return <h2>You are not authorized to view this page</h2>;
}

// Navigation Bar
function NavBar() {
  return (
    <nav style={{ marginBottom: '20px' }}>
      <Link to="/" style={{ marginRight: '10px' }}>Home</Link>
      <Link to="/login" style={{ marginRight: '10px' }}>Login</Link>
      <Link to="/dashboard">Dashboard</Link>
    </nav>
  );
}

// App Component
export default function App() {
  return (
    <Router>
      <NavBar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
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
  );
}
