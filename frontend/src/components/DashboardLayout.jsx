//frontend/src/components/DahsboardLayout.jsx
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function DashboardLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const [theme, setTheme] = useState("dark");
  const navigate = useNavigate();
  const location = useLocation();

  const toggleSidebar = () => setCollapsed(!collapsed);
  const toggleTheme = () => setTheme(theme === "light" ? "dark" : "light");

  const isDark = theme === "dark";

  const navigationItems = [
    { name: "Dashboard Overview", path: "/dashboard", symbol: "≡" },
    { name: "Upload Data", path: "/datasources", symbol: "↑" },
    { name: "View Uploaded Data", path: "/data-view", symbol: "⊞" },
    { name: "Settings", path: "/settings", symbol: "⚙" },
    { name: "Logout", path: "/logout", symbol: "→" },
  ];

  const handleNavigation = (path) => {
    if (path === "/logout") {
      localStorage.removeItem("token");
      navigate("/login");
    } else {
      navigate(path);
    }
  };

  const styles = {
    container: {
      display: "flex",
      height: "100vh",
      backgroundColor: isDark ? "#0e0f0b" : "#f7f7f7",
      color: isDark ? "#00ff80" : "#0e0f0b",
      fontFamily: "'Fira Code', monospace",
    },
    sidebar: {
      width: collapsed ? "70px" : "220px",
      backgroundColor: isDark ? "#111" : "#e8e8e8",
      borderRight: isDark ? "1px solid #00ff80" : "1px solid #333",
      display: "flex",
      flexDirection: "column",
      padding: "15px",
    },
    sidebarItem: {
      cursor: "pointer",
      padding: "12px",
      margin: "8px 0",
      width: "100%",
      color: isDark ? "#00ff80" : "#0e0f0b",
      textAlign: collapsed ? "center" : "left",
      borderRadius: "6px",
      background: "transparent",
      border: "none",
      display: "flex",
      alignItems: "center",
      gap: "10px",
      fontSize: "14px",
    },
    toggleBtn: {
      border: "none",
      background: "transparent",
      color: isDark ? "#00ff80" : "#0e0f0b",
      cursor: "pointer",
      fontSize: "18px",
      marginBottom: "20px",
    },
    main: {
      flex: 1,
      padding: "0",
      background: isDark ? "#0b0c08" : "#ffffff",
      overflowY: "auto",
      display: "flex",
      flexDirection: "column",
    },
    topBar: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "15px 20px",
      borderBottom: isDark ? "1px solid #00ff8040" : "1px solid #ccc",
    },
    button: {
      padding: "8px 16px",
      border: "none",
      borderRadius: "6px",
      background: isDark ? "#00ff80" : "#0e0f0b",
      color: isDark ? "#0e0f0b" : "#00ff80",
      fontWeight: "bold",
      cursor: "pointer",
      fontSize: "14px",
    },
    activeItem: {
      backgroundColor: isDark ? "rgba(0,255,100,0.2)" : "rgba(0,0,0,0.1)",
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.sidebar}>
        <button style={styles.toggleBtn} onClick={toggleSidebar}>
          {collapsed ? "»" : "«"}
        </button>
        {navigationItems.map((item) => (
          <button
            key={item.name}
            style={{
              ...styles.sidebarItem,
              ...(location.pathname === item.path ? styles.activeItem : {}),
            }}
            onClick={() => handleNavigation(item.path)}
            onMouseOver={(e) =>
              (e.currentTarget.style.backgroundColor = isDark
                ? "rgba(0,255,100,0.1)"
                : "rgba(0,0,0,0.1)")
            }
            onMouseOut={(e) =>
              (e.currentTarget.style.backgroundColor = 
                location.pathname === item.path 
                  ? (isDark ? "rgba(0,255,100,0.2)" : "rgba(0,0,0,0.1)")
                  : "transparent")
            }
          >
            <span>{item.symbol}</span>
            {!collapsed && item.name}
          </button>
        ))}
      </div>

      <main style={styles.main}>
        <div style={styles.topBar}>
          <h2 style={{ margin: 0 }}>
            {collapsed ? "BI" : "Business Intelligence Dashboard"}
          </h2>
          <button style={styles.button} onClick={toggleTheme}>
            {theme === "light" ? "Dark" : "Light"}
          </button>
        </div>
        <div style={{ flex: 1 }}>
          {children}
        </div>
      </main>
    </div>
  );
}