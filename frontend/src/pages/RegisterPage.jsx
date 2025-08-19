//frontend/src/pages/RegisterPage.jsx
import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";


export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("viewer");
  const [error, setError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Password validation
  const passwordCriteria = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };
  const isPasswordValid = Object.values(passwordCriteria).every(Boolean);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setEmailError("");
    setIsLoading(true);

    // Validation
    if (password !== confirmPassword) {
      setError("Passwords don't match");
      setIsLoading(false);
      return;
    }
    if (!isPasswordValid) {
      setError("Password doesn't meet requirements");
      setIsLoading(false);
      return;
    }

    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/register",
        { name, email, password, role },
        { withCredentials: true }
      );

      if (res.status === 201) {
        localStorage.setItem("email", email);
        navigate("/verify");
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error || "Registration failed";
      setError(errorMsg);
      
      // Special case: Email failed but user was created
      if (errorMsg.includes("verification")) {
        setEmailError("Account created! Check email or resend code.");
        localStorage.setItem("email", email);
        navigate("/verify");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Create an Account</h2>
        <p style={styles.subtitle}>Join our analytics platform</p>

        {error && <p style={styles.error}>{error}</p>}
        {emailError && <p style={styles.warning}>{emailError}</p>}

        <form onSubmit={handleRegister} style={styles.form}>
          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            style={styles.input}
          />
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

          {/* Password criteria */}
          <ul style={styles.criteriaList}>
            <li style={passwordCriteria.length ? styles.valid : styles.invalid}>
              At least 8 characters
            </li>
            <li style={passwordCriteria.uppercase ? styles.valid : styles.invalid}>
              At least one uppercase letter
            </li>
            <li style={passwordCriteria.lowercase ? styles.valid : styles.invalid}>
              At least one lowercase letter
            </li>
            <li style={passwordCriteria.number ? styles.valid : styles.invalid}>
              At least one number
            </li>
            <li style={passwordCriteria.special ? styles.valid : styles.invalid}>
              At least one special character
            </li>
          </ul>

          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            style={styles.input}
          />
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            style={styles.select}
          >
            <option value="viewer">Viewer</option>
            <option value="analyst">Analyst</option>
            <option value="admin">Admin</option>
          </select>

          <button type="submit" style={styles.button}>Register</button>

          <p style={styles.loginText}>
            Already have an account?{" "}
            <a href="/login" style={styles.link}>Login here</a>
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
    maxWidth: "450px",
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
  error: {
    color: "#ff4d4d",
    marginBottom: "15px",
    fontWeight: "500",
  },
  warning: {
    color: "#FFA500", // Orange for warnings
    marginBottom: "15px",
    fontWeight: "500",
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
  select: {
    padding: "14px 16px",
    border: "1px solid #00ff80",
    backgroundColor: "#0e0f0b",
    color: "#00ff80",
    fontSize: "14px",
    outline: "none",
    boxShadow: "inset 0 0 8px rgba(0, 255, 100, 0.2)",
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
  loginText: {
    marginTop: "20px",
    fontSize: "13px",
    color: "#9fefac",
  },
  link: {
    color: "#00ff80",
    textDecoration: "underline",
  },
  criteriaList: {
    listStyleType: "none",
    textAlign: "left",
    margin: "5px 0 10px 0",
    padding: 0,
    fontSize: "12px",
  },
  valid: {
    color: "#00ff80",
  },
  invalid: {
    color: "#ff4d4d",
  },
};