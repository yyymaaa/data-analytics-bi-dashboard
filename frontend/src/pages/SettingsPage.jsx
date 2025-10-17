// frontend/src/pages/SettingsPage.jsx
import { useState, useEffect } from "react";
import axios from "axios";

export default function SettingsPage() {
  const token = localStorage.getItem("token");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [user, setUser] = useState({
    name: "",
    email: "",
    role: "",
  });

  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Fetch user info
  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const res = await axios.get("http://localhost:5000/api/user/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const { name, email, role } = res.data;
        setUser({ name, email, role });
      } catch (err) {
        console.error(err);
        setMessage("Error fetching user info");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [token]);

  const handleUserChange = (e) => {
    const { name, value } = e.target;
    setUser((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswords((prev) => ({ ...prev, [name]: value }));
  };

  const saveChanges = async () => {
    setMessage("");
    if (passwords.newPassword && passwords.newPassword !== passwords.confirmPassword) {
      setMessage("New passwords do not match");
      return;
    }
    try {
      setSaving(true);
      // Update user info
      await axios.put(
        "http://localhost:5000/api/user/me",
        { name: user.name, email: user.email },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update password if provided
      if (passwords.currentPassword && passwords.newPassword) {
        await axios.put(
          "http://localhost:5000/api/user/me/password",
          { currentPassword: passwords.currentPassword, newPassword: passwords.newPassword },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      setMessage("Settings saved successfully!");
      setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.message || "Error saving settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p style={{ padding: "20px" }}>Loading settings...</p>;

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Settings</h2>

      {/* Account Info */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Account Info</h3>
        <label style={styles.label}>
          Name:
          <input
            type="text"
            name="name"
            value={user.name}
            onChange={handleUserChange}
            style={styles.input}
          />
        </label>
        <label style={styles.label}>
          Email:
          <input
            type="email"
            name="email"
            value={user.email}
            onChange={handleUserChange}
            style={styles.input}
          />
        </label>
        <label style={styles.label}>
          Role:
          <input type="text" value={user.role} readOnly style={{ ...styles.input, backgroundColor: "#222", color: "#00ff80" }} />
        </label>
      </div>

      {/* Section Divider */}
      <div style={styles.divider} />

      {/* Change Password */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Change Password</h3>
        <label style={styles.label}>
          Current Password:
          <input
            type="password"
            name="currentPassword"
            value={passwords.currentPassword}
            onChange={handlePasswordChange}
            style={styles.input}
          />
        </label>
        <label style={styles.label}>
          New Password:
          <input
            type="password"
            name="newPassword"
            value={passwords.newPassword}
            onChange={handlePasswordChange}
            style={styles.input}
          />
        </label>
        <label style={styles.label}>
          Confirm New Password:
          <input
            type="password"
            name="confirmPassword"
            value={passwords.confirmPassword}
            onChange={handlePasswordChange}
            style={styles.input}
          />
        </label>
      </div>

      {/* Section Divider */}
      <div style={styles.divider} />

      <button style={styles.button} onClick={saveChanges} disabled={saving}>
        {saving ? "Saving..." : "Save Changes"}
      </button>

      {message && <p style={{ marginTop: "10px", color: "#00ff80" }}>{message}</p>}
    </div>
  );
}

const styles = {
  container: { padding: "30px", maxWidth: "600px", margin: "0 auto" },
  heading: { fontFamily: "'Fira Code', monospace", color: "#00ff80", marginBottom: "20px" },
  section: { marginBottom: "30px" },
  sectionTitle: { 
    color: "#00ff80", 
    marginBottom: "20px", 
    paddingBottom: "10px",
    borderBottom: "1px solid #333"
  },
  label: { display: "block", marginBottom: "15px", color: "#00ff80" },
  input: {
    display: "block",
    width: "100%",
    padding: "8px",
    marginTop: "5px",
    borderRadius: "6px",
    border: "1px solid #00ff80",
    backgroundColor: "#0e0e12",
    color: "#00ff80",
  },
  button: {
    padding: "10px 20px",
    backgroundColor: "#00ff80",
    border: "none",
    borderRadius: "6px",
    color: "#0e0e12",
    fontWeight: "bold",
    cursor: "pointer",
  },
  divider: {
    height: "1px",
    backgroundColor: "#333",
    margin: "30px 0",
    width: "100%"
  }
};