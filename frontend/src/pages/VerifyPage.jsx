import { useState, useEffect } from "react";
import api from "../services/api"; // axios instance
import { useNavigate } from "react-router-dom";

export default function VerifyPage() {
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const email = localStorage.getItem("email"); // store email after registration

  useEffect(() => {
    // Send verification code on page load
    const sendCode = async () => {
      try {
        const res = await api.post("/auth/send-verification", { email });
        setMessage(res.data.message);
      } catch (err) {
        setError(err.response?.data?.error || "Error sending code");
      }
    };
    sendCode();
  }, [email]);

  const handleVerify = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/auth/verify-code", { email, code });
      setMessage(res.data.message);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.error || "Verification failed");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Two-Step Verification</h2>
        <p style={styles.subtitle}>Enter the code sent to your email</p>
        {message && <p style={styles.success}>{message}</p>}
        {error && <p style={styles.error}>{error}</p>}
        <form onSubmit={handleVerify} style={styles.form}>
          <input
            type="text"
            placeholder="Enter verification code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
            style={styles.input}
          />
          <button type="submit" style={styles.button}>Verify</button>
        </form>
      </div>
    </div>
  );
}

// Styles (reuse green neon style from RegisterPage)
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
  title: { fontSize: "24px", fontWeight: "700", marginBottom: "10px" },
  subtitle: { fontSize: "14px", color: "#9fefac", marginBottom: "25px" },
  form: { display: "flex", flexDirection: "column", gap: "15px" },
  input: {
    padding: "14px",
    border: "1px solid #00ff80",
    backgroundColor: "#0e0f0b",
    color: "#00ff80",
    fontSize: "14px",
    outline: "none",
    boxShadow: "inset 0 0 8px rgba(0, 255, 100, 0.2)",
    textAlign: "center",
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
  },
  success: { color: "#00ff80" },
  error: { color: "#ff4d4d" },
};
