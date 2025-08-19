import { useState, useEffect, useRef } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";

export default function VerifyPage() {
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const navigate = useNavigate();
  const email = localStorage.getItem("email");
  const hasSentRef = useRef(false);
  const cooldownIntervalRef = useRef(null);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (cooldownIntervalRef.current) {
        clearInterval(cooldownIntervalRef.current);
      }
    };
  }, []);

  // Send verification code on page load
  useEffect(() => {
    if (!email) {
      setError("No email found. Please register first.");
      return;
    }

    // Prevent multiple sends
    if (hasSentRef.current) {
      return;
    }

    sendVerificationCode();
  }, [email]);

  const sendVerificationCode = async () => {
    try {
      setLoading(true);
      hasSentRef.current = true;
      console.log('Sending verification request...');
      const res = await api.post("/verification/send-verification", { email });
      console.log('Response received:', res);
      setMessage(res.data.message);
      setError("");
      
      // Start cooldown timer
      startCooldown(60);
    } catch (err) {
      console.error('Error details:', err);
      setError(err.response?.data?.error || "Error sending code");
      setMessage("");
      hasSentRef.current = false; // Reset on error
    } finally {
      setLoading(false);
    }
  };

  const startCooldown = (seconds) => {
    setCooldown(seconds);
    
    if (cooldownIntervalRef.current) {
      clearInterval(cooldownIntervalRef.current);
    }

    cooldownIntervalRef.current = setInterval(() => {
      setCooldown(prev => {
        if (prev <= 1) {
          clearInterval(cooldownIntervalRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!code) return setError("Please enter the verification code");

    try {
      setLoading(true);
      setError("");
      const trimmedCode = code.trim();
      console.log('Verifying code:', trimmedCode);
      const res = await api.post("/verification/verify-code", { 
        email, 
        code: trimmedCode 
      });
      
      setMessage(res.data.message);
      setTimeout(() => navigate("/dashboard"), 1000);
    } catch (err) {
      console.error('Verification error:', err);
      const errorMsg = err.response?.data?.error || "Verification failed";
      setError(errorMsg);
      setMessage("");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0) {
      setError(`Please wait ${cooldown} seconds before resending`);
      return;
    }

    try {
      setLoading(true);
      setError("");
      const res = await api.post("/verification/send-verification", { email });
      setMessage(res.data.message + " (resent)");
      
      // Start cooldown timer
      startCooldown(60);
    } catch (err) {
      console.error('Resend error:', err);
      const errorMsg = err.response?.data?.error || "Failed to resend code";
      setError(errorMsg);
      setMessage("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Two-Step Verification</h2>
        <p style={styles.subtitle}>
          Enter the code sent to your email: <strong>{email}</strong>
        </p>

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
            disabled={loading}
          />
          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? "Verifying..." : "Verify"}
          </button>
        </form>

        <button 
          onClick={handleResend} 
          style={{
            ...styles.resend,
            opacity: cooldown > 0 ? 0.6 : 1,
            cursor: cooldown > 0 ? 'not-allowed' : 'pointer'
          }} 
          disabled={loading || cooldown > 0}
        >
          {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend Code"}
        </button>

        {cooldown > 0 && (
          <p style={styles.cooldownText}>
            You can request a new code in {cooldown} seconds
          </p>
        )}
      </div>
    </div>
  );
}

// ===== Styles (green neon theme) =====
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
    transition: "all 0.3s ease",
    opacity: 1,
  },
  resend: {
    marginTop: "15px",
    padding: "10px",
    border: "1px solid #00ff80",
    background: "transparent",
    color: "#00ff80",
    fontSize: "14px",
    textDecoration: "underline",
    transition: "all 0.3s ease",
  },
  cooldownText: {
    marginTop: "10px",
    fontSize: "12px",
    color: "#9fefac",
  },
  success: { 
    color: "#00ff80", 
    marginBottom: "10px",
    textShadow: "0 0 5px rgba(0, 255, 128, 0.5)"
  },
  error: { 
    color: "#ff4d4d", 
    marginBottom: "10px",
    textShadow: "0 0 5px rgba(255, 77, 77, 0.5)"
  },
};