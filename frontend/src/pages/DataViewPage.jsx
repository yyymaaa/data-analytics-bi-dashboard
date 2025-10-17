// frontend/src/pages/DataViewPage.jsx
import { useState, useEffect } from "react";
import axios from "axios";

export default function DataViewPage() {
  const [dataSources, setDataSources] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("token");

  const fetchDataSources = async (searchTerm = "") => {
    try {
      setLoading(true);
      setMessage("");
      const res = await axios.get(
        `http://localhost:5000/api/datasource?search=${encodeURIComponent(searchTerm)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.sources.length === 0) setMessage("No results found");
      setDataSources(res.data.sources);
    } catch (err) {
      console.error(err);
      setMessage("Error fetching data sources");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDataSources();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchDataSources(search);
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>View Uploaded Data</h2>

      <form onSubmit={handleSearch} style={styles.searchForm}>
        <input
          type="text"
          placeholder="Search by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={styles.searchInput}
        />
        <button type="submit" style={styles.searchBtn}>Search</button>
      </form>

      {loading ? (
        <p style={styles.text}>Loading...</p>
      ) : message ? (
        <p style={styles.text}>{message}</p>
      ) : (
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Name</th>
              <th style={styles.th}>Type</th>
              <th style={styles.th}>Columns</th>
              <th style={styles.th}>Rows</th>
              <th style={styles.th}>Uploaded At</th>
            </tr>
          </thead>
          <tbody>
            {dataSources.map((ds) => (
              <tr key={ds._id}>
                <td style={styles.td}>{ds.name}</td>
                <td style={styles.td}>{ds.type}</td>
                <td style={styles.td}>{ds.metadata?.headers?.join(", ") || "-"}</td>
                <td style={styles.td}>{ds.metadata?.rowCount || "-"}</td>
                <td style={styles.td}>{new Date(ds.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: "30px",
  },
  heading: {
    color: "#00ff80",
    fontFamily: "'Fira Code', monospace",
    marginBottom: "20px",
  },
  searchForm: {
    display: "flex",
    gap: "10px",
    marginBottom: "20px",
  },
  searchInput: {
    flex: 1,
    padding: "10px",
    borderRadius: "6px",
    border: "2px solid #00ff80",
    backgroundColor: "#0e0e12",
    color: "#00ff80",
    fontFamily: "'Fira Code', monospace",
  },
  searchBtn: {
    padding: "10px 20px",
    border: "none",
    borderRadius: "6px",
    backgroundColor: "#00ff80",
    color: "#0e0e12",
    fontWeight: "bold",
    cursor: "pointer",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    color: "#00ff80",
    fontFamily: "'Fira Code', monospace",
  },
  th: {
    border: "1px solid #00ff80",
    padding: "8px",
    textAlign: "left",
  },
  td: {
    border: "1px solid #00ff80",
    padding: "8px",
  },
  text: {
    color: "#b8fccc",
  },
};
