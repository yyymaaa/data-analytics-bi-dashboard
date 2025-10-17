//frontend/src/pages/Login.jsx
import { useState } from "react";
import api from "../services/api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/auth/login", { email, password });

      // Save token & role in localStorage
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);

      alert("Login successful!");
      window.location.href = "/dashboard"; // redirect to dashboard
    } catch (err) {
      alert(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Welcome Back</h2>
        <p style={styles.subtitle}>Sign in to your analytics dashboard</p>
        <form onSubmit={handleLogin} style={styles.form}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={styles.input}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={styles.input}
          />
          <button type="submit" style={styles.button}>
            Login
          </button>
          <p style={styles.registerText}>
            Don't have an account?{" "}
            <a href="/register" style={styles.link}>
              Register here
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}

// ===== Styling =====
const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(160deg, #0b0c08, #0f110c)",
    fontFamily: "'Fira Code', monospace",
  },
  card: {
    backgroundColor: "#0e0f0b",
    padding: "50px 40px",
    width: "100%",
    maxWidth: "400px",
    color: "#00ff80",
    textAlign: "center",
    border: "1px solid rgba(0,255,100,0.5)",
    boxShadow: "0 0 30px rgba(0, 255, 100, 0.3), 0 0 60px rgba(0, 255, 100, 0.1)",
  },
  title: {
    fontSize: "28px",
    fontWeight: "700",
    marginBottom: "5px",
    textShadow: "0 0 10px #00ff80",
  },
  subtitle: {
    fontSize: "14px",
    color: "#9fefac",
    marginBottom: "25px",
    letterSpacing: "0.5px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },
  input: {
    padding: "14px 16px",
    border: "1px solid #00ff80",
    backgroundColor: "#0e0f0b",
    color: "#00ff80",
    fontSize: "14px",
    outline: "none",
    boxShadow: "inset 0 0 8px rgba(0, 255, 100, 0.2)",
    textAlign: "left",
  },
  button: {
    padding: "14px",
    border: "none",
    background: "linear-gradient(90deg, #00ff80, #00b36b)",
    color: "#0e0f0b",
    fontWeight: "700",
    fontSize: "16px",
    cursor: "pointer",
    boxShadow: "0 0 15px rgba(0, 255, 100, 0.4)",
    transition: "all 0.3s ease",
  },
  registerText: {
    marginTop: "20px",
    fontSize: "13px",
    color: "#9fefac",
  },
  link: {
    color: "#00ff80",
    textDecoration: "underline",
  },
};
