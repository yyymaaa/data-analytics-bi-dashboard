// frontend/src/pages/DataSourcePage.jsx
import { useState } from "react";
import axios from "axios";

export default function DataSourcePage() {
  const [step, setStep] = useState(1);
  const [type, setType] = useState("");
  const [name, setName] = useState("");
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [config, setConfig] = useState({});
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("token");

  const nextStep = () => setStep((s) => s + 1);
  const prevStep = () => setStep((s) => s - 1);

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setFileName(selectedFile ? selectedFile.name : "");
  };

  const handleNameChange = (e) => setName(e.target.value);

  const handleCreateSource = async () => {
    try {
      setLoading(true);
      setMessage("");

      if (type === "csv-upload" && file) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("type", type);
        formData.append("name", name || file.name);

        const res = await axios.post(
          "http://localhost:5000/api/datasource/upload",
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setMessage(`File uploaded successfully. ${res.data.rowsSaved} rows processed.`);
        setPreview(res.data.source);
        nextStep();
      } else {
        const res = await axios.post(
          "http://localhost:5000/api/datasource",
          { type, name, config },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setMessage("Data source created successfully");
        setPreview(res.data.source);
        nextStep();
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message || "Failed to create data source";
      setMessage(`Error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  // Step 1 — Choose type
  const Step1 = () => (
    <div style={styles.card}>
      <h2 style={styles.heading}>Step 1: Choose Data Source Type</h2>
      <p style={styles.text}>Select where your data is coming from.</p>
      <div style={styles.options}>
        {["csv-upload", "google-analytics", "aws", "manual"].map((option) => (
          <button
            key={option}
            style={{
              ...styles.optionBtn,
              ...(type === option ? styles.optionBtnSelected : {}),
            }}
            onClick={() => setType(option)}
          >
            {option === "csv-upload"
              ? "Upload CSV File"
              : option === "google-analytics"
              ? "Google Analytics"
              : option === "aws"
              ? "AWS Data"
              : "Manual Entry"}
          </button>
        ))}
      </div>
      {type && (
        <div style={styles.actions}>
          <button style={styles.nextBtn} onClick={nextStep}>Next</button>
        </div>
      )}
    </div>
  );

  // Step 2 — Connect or upload
  const Step2 = () => (
    <div style={styles.card}>
      <h2 style={styles.heading}>Step 2: Configure Data Source</h2>

      <label style={styles.label}>Name your data source:</label>
      <input
        style={styles.input}
        type="text"
        placeholder="Example: October Sales Report"
        value={name}
        onChange={handleNameChange}
      />

      {type === "csv-upload" && (
        <>
          <label style={styles.label}>Upload your CSV file:</label>
          <div style={styles.fileUpload}>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              style={styles.fileInput}
            />
            {fileName && <p style={styles.fileName}>Selected: {fileName}</p>}
          </div>
        </>
      )}

      {type === "google-analytics" && (
        <>
          <label style={styles.label}>Google Analytics API key:</label>
          <input
            style={styles.input}
            type="text"
            placeholder="Enter API key"
            value={config.apiKey || ""}
            onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
          />
        </>
      )}

      {type === "aws" && (
        <>
          <label style={styles.label}>AWS Access Key:</label>
          <input
            style={styles.input}
            type="text"
            placeholder="AWS Access Key"
            value={config.accessKey || ""}
            onChange={(e) => setConfig({ ...config, accessKey: e.target.value })}
          />
          <label style={styles.label}>AWS Secret Key:</label>
          <input
            style={styles.input}
            type="password"
            placeholder="AWS Secret Key"
            value={config.secretKey || ""}
            onChange={(e) => setConfig({ ...config, secretKey: e.target.value })}
          />
        </>
      )}

      {type === "manual" && (
        <>
          <label style={styles.label}>Sample data (JSON format):</label>
          <textarea
            style={styles.textArea}
            rows="5"
            placeholder='Example: {"region": "East", "sales": 1000}'
            value={config.data || ""}
            onChange={(e) => setConfig({ ...config, data: e.target.value })}
          />
        </>
      )}

      <div style={styles.actions}>
        <button style={styles.prevBtn} onClick={prevStep}>Back</button>
        <button
          style={styles.nextBtn}
          onClick={handleCreateSource}
          disabled={loading || !name || (type === "csv-upload" && !file)}
        >
          {loading ? "Processing..." : "Next"}
        </button>
      </div>
      {message && <p style={styles.message}>{message}</p>}
    </div>
  );

  // Step 3 — Review & Confirm
  const Step3 = () => {
    if (!preview) return <p>Loading preview...</p>;

    const headers = preview?.metadata?.headers || [];
    const rows = preview?.metadata?.rowCount || 0;

    return (
      <div style={styles.card}>
        <h2 style={styles.heading}>Step 3: Review & Confirm</h2>
        <p style={styles.text}>Check your data source before finalizing:</p>

        <div style={styles.previewBox}>
          <p><strong>Name:</strong> {preview.name}</p>
          <p><strong>Type:</strong> {preview.type}</p>
          <p><strong>Rows:</strong> {rows}</p>
          <p><strong>Columns:</strong> {headers.join(", ")}</p>

          {preview?.sampleRows && (
            <table style={styles.table}>
              <thead>
                <tr>
                  {headers.map((h) => <th key={h}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {preview.sampleRows.map((row, idx) => (
                  <tr key={idx}>
                    {headers.map((h) => <td key={h}>{row[h]}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div style={styles.actions}>
          <button style={styles.prevBtn} onClick={prevStep}>Back</button>
          <button style={styles.nextBtn} onClick={() => alert("Data source confirmed!")}>Confirm</button>
        </div>
        {message && <p style={styles.message}>{message}</p>}
      </div>
    );
  };

  return (
    <div style={styles.container}>
      {step === 1 && <Step1 />}
      {step === 2 && <Step2 />}
      {step === 3 && <Step3 />}
    </div>
  );
}


const styles = {
  container: {
    padding: "40px",
    color: "#00ff80",
    fontFamily: "'Fira Code', monospace, 'Courier New'",
    width: "100%",
    minHeight: "calc(100vh - 80px)",
    backgroundColor: "#0e0e12",
    boxSizing: "border-box",
  },
  card: {
    backgroundColor: "#18181d",
    padding: "40px",
    borderRadius: "10px",
    boxShadow: "0 0 15px rgba(0,255,128,0.3)",
    maxWidth: "600px",
    margin: "0 auto",
    border: "1px solid #00ff80",
  },
  heading: {
    fontSize: "1.5rem",
    marginBottom: "15px",
    textShadow: "0 0 10px #00ff80",
    color: "#00ff80",
    textAlign: "center",
  },
  text: { 
    color: "#b8fccc", 
    marginBottom: "20px",
    textAlign: "center",
    fontSize: "1rem",
  },
  options: { 
    display: "flex", 
    flexDirection: "column", 
    gap: "12px",
    marginBottom: "20px",
  },
  optionBtn: {
    padding: "15px",
    border: "2px solid #00ff80",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "1rem",
    backgroundColor: "#18181d",
    color: "#00ff80",
    transition: "all 0.3s ease",
    fontFamily: "'Fira Code', monospace, 'Courier New'",
  },
  optionBtnSelected: {
    backgroundColor: "#00ff80",
    color: "#0e0e12",
    fontWeight: "bold",
  },
  label: { 
    display: "block", 
    marginTop: "20px", 
    marginBottom: "8px",
    color: "#00ff80",
    fontSize: "1rem",
    fontWeight: "bold",
  },
  input: {
    width: "100%",
    padding: "12px",
    borderRadius: "6px",
    border: "2px solid #00ff80",
    backgroundColor: "#0e0e12",
    color: "#00ff80",
    fontSize: "1rem",
    boxSizing: "border-box",
    fontFamily: "'Fira Code', monospace, 'Courier New'",
  },
  fileUpload: {
    margin: "10px 0",
  },
  fileInput: {
    width: "100%",
    padding: "12px",
    backgroundColor: "#0e0e12",
    border: "2px solid #00ff80",
    borderRadius: "6px",
    color: "#00ff80",
    boxSizing: "border-box",
    fontFamily: "'Fira Code', monospace, 'Courier New'",
  },
  fileName: {
    color: "#b8fccc",
    fontSize: "0.9rem",
    margin: "8px 0",
    fontStyle: "italic",
  },
  textArea: {
    width: "100%",
    backgroundColor: "#0e0e12",
    border: "2px solid #00ff80",
    color: "#00ff80",
    borderRadius: "6px",
    padding: "12px",
    fontSize: "1rem",
    boxSizing: "border-box",
    fontFamily: "'Fira Code', monospace, 'Courier New'",
    resize: "vertical",
  },
  actions: { 
    marginTop: "30px", 
    display: "flex", 
    justifyContent: "space-between",
    gap: "15px",
  },
  nextBtn: {
    backgroundColor: "#00ff80",
    color: "#0e0e12",
    border: "none",
    padding: "12px 30px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "1rem",
    fontWeight: "bold",
    fontFamily: "'Fira Code', monospace, 'Courier New'",
    transition: "all 0.3s ease",
    flex: 1,
  },
  prevBtn: {
    backgroundColor: "transparent",
    color: "#00ff80",
    border: "2px solid #00ff80",
    padding: "12px 30px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "1rem",
    fontWeight: "bold",
    fontFamily: "'Fira Code', monospace, 'Courier New'",
    transition: "all 0.3s ease",
    flex: 1,
  },
  previewBox: {
    backgroundColor: "#0e0e12",
    border: "2px solid #00ff80",
    borderRadius: "8px",
    padding: "20px",
    overflowX: "auto",
    margin: "20px 0",
  },
  pre: {
    color: "#00ff80",
    fontSize: "0.9rem",
    margin: 0,
    fontFamily: "'Fira Code', monospace, 'Courier New'",
  },
  message: {
    marginTop: "15px",
    color: "#00ff80",
    textAlign: "center",
    fontSize: "1rem",
    padding: "10px",
    borderRadius: "6px",
    backgroundColor: "rgba(0, 255, 128, 0.1)",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: "15px",
    marginBottom: "15px",
  },
  th: {
    border: "1px solid #00ff80",
    padding: "6px",
    textAlign: "left",
  },
  td: {
    border: "1px solid #00ff80",
    padding: "6px",
  },
};