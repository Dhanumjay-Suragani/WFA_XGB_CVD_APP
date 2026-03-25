import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./Form.css";

export default function Results({ data: propData }) {
  const location = useLocation();
  const navigate = useNavigate();

  const data = location.state || propData;

  if (!data) {
    return <h3>No Data Found</h3>;
  }

  const riskStr = typeof data.risk === "string" ? data.risk : `${Math.round((data.risk_score || 0) * 100)}%`;
  const riskValue = parseInt(String(riskStr).replace(/%/g, ""), 10) || 0;
  const prediction =
    data.prediction !== undefined && data.prediction !== null ? data.prediction : null;

  return (
    <div className="card">
      <h3>Model result</h3>

      <p style={{ color: "#555", fontSize: 14 }}>
        Output from <code>full_pipeline.pkl</code> (binary risk estimate and calibrated probability of class 1).
      </p>

      <h2>{riskStr}</h2>

      {prediction !== null ? (
        <p>
          <b>Prediction class:</b> {prediction}{" "}
          <span style={{ color: "#666", fontSize: 13 }}>
            (interpret per your training label; often 1 = disease indicator)
          </span>
        </p>
      ) : null}

      {data.risk_score != null ? (
        <p>
          <b>Risk score (P class 1):</b> {(data.risk_score * 100).toFixed(1)}%
        </p>
      ) : null}

      <div
        style={{
          width: "100%",
          height: "10px",
          background: "#ddd",
          borderRadius: "5px",
        }}
      >
        <div
          style={{
            width: `${Math.min(100, Math.max(0, riskValue))}%`,
            height: "10px",
            background:
              data.status === "Low Risk"
                ? "green"
                : data.status === "Moderate Risk"
                ? "orange"
                : "red",
          }}
        />
      </div>

      <p>
        <b>Status:</b> {data.status}
      </p>
      <p>
        <b>Recommendation:</b> {data.recommendation}
      </p>

      {data.ocr_warning ? (
        <p style={{ fontSize: 13, color: "#c62828", background: "#ffebee", padding: 10, borderRadius: 6 }}>
          <b>OCR notice:</b> {data.ocr_warning}
        </p>
      ) : null}

      {Array.isArray(data.defaults_used) && data.defaults_used.length > 0 ? (
        <p style={{ fontSize: 12, color: "#6d4c41", background: "#fff8e1", padding: 10, borderRadius: 6 }}>
          <b>Defaults used:</b> {data.defaults_used.join(", ")}
        </p>
      ) : null}

      {data.ocr_override && (data.ocr_override.trestbps != null || data.ocr_override.chol != null) ? (
        <p style={{ fontSize: 13, color: "#1565c0" }}>
          <b>OCR applied:</b> trestbps from report = {String(data.ocr_override.trestbps)}, chol ={" "}
          {String(data.ocr_override.chol)} (used for the model run).
        </p>
      ) : null}

      {data.file ? (
        <p>
          <b>Report file:</b> {data.file}
        </p>
      ) : null}

      {data.ocr_text ? (
        <p style={{ fontSize: 12, color: "#666", wordBreak: "break-word" }}>
          <b>OCR excerpt:</b> {data.ocr_text}
        </p>
      ) : null}

      <button onClick={() => navigate("/recommendations")}>View Recommendations</button>
    </div>
  );
}
