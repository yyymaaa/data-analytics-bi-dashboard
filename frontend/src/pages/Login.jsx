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
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={styles.input}
            />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={styles.input}
            />
          </div>
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
    backgroundColor: "#0e0e12",
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontFamily: "'Inter', sans-serif",
  },
  card: {
    backgroundColor: "#18181d",
    padding: "40px",
    borderRadius: "12px",
    boxShadow: "0px 4px 20px rgba(0,0,0,0.5)",
    width: "100%",
    maxWidth: "400px",
    color: "#fff",
  },
  title: {
    fontSize: "24px",
    fontWeight: "600",
    marginBottom: "10px",
    textAlign: "center",
  },
  subtitle: {
    fontSize: "14px",
    color: "#888",
    marginBottom: "30px",
    textAlign: "center",
  },
  form: {
    display: "flex",
    flexDirection: "column",
  },
  inputGroup: {
    marginBottom: "20px",
  },
  label: {
    fontSize: "14px",
    marginBottom: "5px",
    display: "block",
  },
  input: {
    width: "100%",
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #333",
    backgroundColor: "#0e0e12",
    color: "#fff",
    fontSize: "14px",
    outline: "none",
    transition: "border-color 0.2s ease",
  },
  button: {
    padding: "12px",
    background: "linear-gradient(90deg, #4f46e5, #6366f1)",
    border: "none",
    borderRadius: "8px",
    color: "#fff",
    fontSize: "16px",
    cursor: "pointer",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
  },
  registerText: {
    marginTop: "15px",
    fontSize: "14px",
    color: "#aaa",
    textAlign: "center",
  },
  link: {
    color: "#6366f1",
    textDecoration: "none",
  },
};
