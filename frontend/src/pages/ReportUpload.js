import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./Form.css";
import API_BASE_URL from "../config";
import { MODEL_FEATURES } from "../modelFeatures";

export default function ReportUpload({ onResult }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const bioData = location.state?.params || {};
  const mode = location.state?.mode || "manual";

  const handlePredict = async () => {
    const user =
      localStorage.getItem("userEmail") ||
      localStorage.getItem("userName") ||
      "Guest";

    const providedCount = MODEL_FEATURES.filter(
      (f) => bioData[f.key] !== "" && bioData[f.key] !== undefined && bioData[f.key] !== null
    ).length;
    if (mode === "upload_only" && !file) {
      alert("Please upload a report image for upload-only mode.");
      return;
    }
    if (providedCount === 0 && !file) {
      alert("Provide manual details or upload a report image.");
      return;
    }

    const formData = new FormData();
    formData.append("user", user);
    for (const f of MODEL_FEATURES) {
      const raw = bioData[f.key];
      if (raw !== "" && raw !== undefined && raw !== null) {
        formData.append(f.key, String(raw));
      }
    }
    if (file) {
      formData.append("file", file);
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/predict`, {
        method: "POST",
        body: formData,
      });
      const result = await res.json();

      if (result.success) {
        // Persist the prediction in App state (used as fallback by Results page).
        if (typeof onResult === "function") onResult(result);
        navigate("/results", { state: result });
      } else {
        if (Array.isArray(result.missing_fields) && result.missing_fields.length) {
          alert(`${result.message}\nMissing: ${result.missing_fields.join(", ")}`);
        } else {
          alert(result.message || "Prediction failed");
        }
      }
    } catch (err) {
      console.error(err);
      alert("Backend connection error. Ensure Flask is running on port 5000.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card neat-form-container">
      <h3 className="form-title">Review &amp; predict</h3>
      <p className="form-subtitle">
        {mode === "upload_only"
          ? "Upload-only mode: provide a report image; OCR will try to extract key values and missing fields fall back to model defaults."
          : "Manual mode: values below are sent to the saved ML model. Upload is optional and OCR can override trestbps/chol if detected."}
      </p>

      <div
        className="form-scroll-area"
        style={{
          maxHeight: 240,
          overflowY: "auto",
          border: "1px solid #ddd",
          borderRadius: 8,
          padding: 12,
          marginBottom: 16,
        }}
      >
        <table style={{ width: "100%", fontSize: 13 }}>
          <tbody>
            {MODEL_FEATURES.map((f) => (
              <tr key={f.key}>
                <td style={{ padding: "4px 8px", fontWeight: 600, verticalAlign: "top" }}>{f.label}</td>
                <td style={{ padding: "4px 8px" }}>
                  {bioData[f.key] !== "" && bioData[f.key] !== undefined ? bioData[f.key] : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div
        className="upload-section"
        style={{
          padding: "24px 16px",
          textAlign: "center",
          border: "2px dashed #3498db",
          borderRadius: 8,
          marginBottom: 16,
        }}
      >
        <label className="file-label" style={{ display: "block", marginBottom: 8, fontWeight: "bold" }}>
          Optional: medical report image (OCR)
        </label>
        <input
          type="file"
          accept="image/*"
          className="form-input"
          onChange={(e) => setFile(e.target.files[0] || null)}
        />
        {file ? (
          <p style={{ color: "#2ecc71", marginTop: 8, fontSize: 13 }}>Selected: {file.name}</p>
        ) : (
          <p style={{ color: "#888", marginTop: 8, fontSize: 12 }}>
            {mode === "upload_only"
              ? "Required in upload-only mode."
              : "Skip if you only use manual values above."}
          </p>
        )}
      </div>

      <div className="button-group">
        <button type="button" className="back-btn" onClick={() => navigate(-1)}>
          Back
        </button>
        <button type="button" className="predict-btn-blue" onClick={handlePredict} disabled={loading}>
          {loading ? "Running model…" : "Run ML prediction"}
        </button>
      </div>
    </div>
  );
}
