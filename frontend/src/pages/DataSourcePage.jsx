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

    // Detect file type automatically
    if (selectedFile) {
      const ext = selectedFile.name.split(".").pop().toLowerCase();
      if (ext === "csv") setType("csv-upload");
      else if (["xls", "xlsx"].includes(ext)) setType("excel-upload");
    }
  };

  const handleNameChange = (e) => setName(e.target.value);

  const handleCreateSource = async () => {
    try {
      setLoading(true);
      setMessage("");

      if (["csv-upload", "excel-upload"].includes(type) && file) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("type", type);
        formData.append("name", name || file.name);

        // Use the correct endpoint based on file type
        const endpoint = type === "csv-upload" 
          ? "http://localhost:5000/api/datasource/upload/csv"
          : "http://localhost:5000/api/datasource/upload/excel";

        const res = await axios.post(endpoint, formData, { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          } 
        });

        setMessage(`Data uploaded successfully.`);
        setPreview(res.data.dataSource);
        nextStep();
      } else if (type === "google-analytics") {
        const res = await axios.post(
          "http://localhost:5000/api/datasource/google-analytics",
          { 
            name: name,
            config: config
          },
          { 
            headers: { 
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            } 
          }
        );
        setMessage("Google Analytics source linked successfully.");
        setPreview(res.data.dataSource);
        nextStep();
      } else if (type === "manual") {
        const res = await axios.post(
          "http://localhost:5000/api/datasource/manual",
          { name, data: config.data },
          { 
            headers: { 
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            } 
          }
        );
        setMessage("Manual dataset created successfully.");
        setPreview(res.data.dataSource);
        nextStep();
      } else {
        setMessage("Please select a valid data source and upload.");
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Failed to create data source";
      setMessage(`Error: ${errorMessage}`);
      console.error('Upload error:', err);
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
        {[
          "csv-upload",
          "excel-upload",
          "google-analytics",
          "manual",
        ].map((option) => (
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
              : option === "excel-upload"
              ? "Upload Excel File"
              : option === "google-analytics"
              ? "Google Analytics"
              : "Manual Entry"}
          </button>
        ))}
      </div>
      {type && (
        <div style={styles.actions}>
          <button style={styles.nextBtn} onClick={nextStep}>
            Next
          </button>
        </div>
      )}
    </div>
  );

  // Step 2 — Upload or Configure
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

      {["csv-upload", "excel-upload"].includes(type) && (
        <>
          <label style={styles.label}>
            Upload your {type === "csv-upload" ? "CSV" : "Excel"} file:
          </label>
          <div style={styles.fileUpload}>
            <input
              type="file"
              accept={type === "csv-upload" ? ".csv" : ".xls,.xlsx"}
              onChange={handleFileSelect}
              style={styles.fileInput}
            />
            {fileName && <p style={styles.fileName}>Selected: {fileName}</p>}
          </div>
        </>
      )}

      {type === "google-analytics" && (
        <>
          <label style={styles.label}>Google Analytics Account Name:</label>
          <input
            style={styles.input}
            type="text"
            placeholder="Enter your GA account name"
            value={config.accountName || ""}
            onChange={(e) => setConfig({ ...config, accountName: e.target.value })}
          />

          <label style={styles.label}>Property ID:</label>
          <input
            style={styles.input}
            type="text"
            placeholder="Example: GA-123456789"
            value={config.propertyId || ""}
            onChange={(e) => setConfig({ ...config, propertyId: e.target.value })}
          />

          <label style={styles.label}>API Key (Optional):</label>
          <input
            style={styles.input}
            type="text"
            placeholder="Enter your API key if needed"
            value={config.apiKey || ""}
            onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
          />
        </>
      )}

      {type === "manual" && (
        <>
          <label style={styles.label}>Enter sample JSON data:</label>
          <textarea
            style={styles.textArea}
            rows="6"
            placeholder='Example: [{"region":"East","sales":1200}]'
            value={config.data || ""}
            onChange={(e) => setConfig({ ...config, data: e.target.value })}
          />
        </>
      )}

      <div style={styles.actions}>
        <button style={styles.prevBtn} onClick={prevStep}>
          Back
        </button>
        <button
          style={styles.nextBtn}
          onClick={handleCreateSource}
          disabled={loading || !name || (["csv-upload", "excel-upload"].includes(type) && !file)}
        >
          {loading ? "Processing..." : "Next"}
        </button>
      </div>

      {message && <p style={styles.message}>{message}</p>}
    </div>
  );

  // Step 3 — Review
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
                  {headers.map((h) => (
                    <th key={h} style={styles.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {preview.sampleRows.map((row, idx) => (
                  <tr key={idx}>
                    {headers.map((h) => (
                      <td key={h} style={styles.td}>{row[h]}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div style={styles.actions}>
          <button style={styles.prevBtn} onClick={prevStep}>
            Back
          </button>
          <button
            style={styles.nextBtn}
            onClick={() => alert("✅ Data source confirmed!")}
          >
            Confirm
          </button>
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

// === STYLES ===
const styles = {
  container: {
    padding: "40px",
    color: "#00ff80",
    fontFamily: "'Fira Code', monospace",
    width: "100%",
    minHeight: "calc(100vh - 80px)",
    backgroundColor: "#0e0e12",
  },
  card: {
    backgroundColor: "#18181d",
    padding: "40px",
    borderRadius: "12px",
    boxShadow: "0 0 15px rgba(0,255,128,0.25)",
    maxWidth: "640px",
    margin: "0 auto",
    border: "1px solid #00ff80",
  },
  heading: {
    fontSize: "1.6rem",
    marginBottom: "20px",
    textAlign: "center",
  },
  text: { color: "#b8fccc", marginBottom: "20px", textAlign: "center" },
  options: { display: "flex", flexDirection: "column", gap: "12px" },
  optionBtn: {
    padding: "15px",
    border: "2px solid #00ff80",
    borderRadius: "8px",
    cursor: "pointer",
    backgroundColor: "#18181d",
    color: "#00ff80",
    transition: "0.3s",
  },
  optionBtnSelected: {
    backgroundColor: "#00ff80",
    color: "#0e0e12",
    fontWeight: "bold",
  },
  label: { display: "block", marginTop: "20px", color: "#00ff80" },
  input: {
    width: "100%",
    padding: "12px",
    borderRadius: "6px",
    border: "2px solid #00ff80",
    backgroundColor: "#0e0e12",
    color: "#00ff80",
  },
  textArea: {
    width: "100%",
    padding: "12px",
    border: "2px solid #00ff80",
    borderRadius: "6px",
    backgroundColor: "#0e0e12",
    color: "#00ff80",
  },
  actions: {
    marginTop: "30px",
    display: "flex",
    justifyContent: "space-between",
  },
  nextBtn: {
    backgroundColor: "#00ff80",
    color: "#0e0e12",
    padding: "12px 24px",
    borderRadius: "6px",
    border: "none",
    cursor: "pointer",
  },
  prevBtn: {
    backgroundColor: "transparent",
    color: "#00ff80",
    border: "2px solid #00ff80",
    padding: "12px 24px",
    borderRadius: "6px",
    cursor: "pointer",
  },
  previewBox: {
    backgroundColor: "#0e0e12",
    border: "1px solid #00ff80",
    borderRadius: "8px",
    padding: "20px",
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: "15px",
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
  message: {
    marginTop: "20px",
    color: "#00ff80",
    textAlign: "center",
  },
};