import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Form.css";
import { MODEL_FEATURES, initialModelFormState } from "../modelFeatures";

export default function BiologicalInfo() {
  const navigate = useNavigate();
  const [bioData, setBioData] = useState(initialModelFormState);

  const handleChange = (e) => {
    setBioData({ ...bioData, [e.target.name]: e.target.value });
  };

  const handleManualNext = () => {
    for (const f of MODEL_FEATURES) {
      const v = bioData[f.key];
      if (v === "" || v === null || v === undefined) {
        alert(`Please fill in: ${f.label}`);
        return;
      }
      if (f.type === "number" && Number.isNaN(Number(v))) {
        alert(`${f.label} must be a number.`);
        return;
      }
    }
    navigate("/report-upload", { state: { params: bioData, mode: "manual" } });
  };

  const handleUploadOnly = () => {
    navigate("/report-upload", { state: { params: {}, mode: "upload_only" } });
  };

  return (
    <div className="card neat-form-container">
      <h3 className="form-title">Clinical parameters</h3>
      <p className="form-subtitle">
        Choose a flow: enter all attributes manually, or skip and upload report only. Manual mode requires all
        {` ${MODEL_FEATURES.length} `} model attributes.
      </p>

      <div className="form-scroll-area">
        {MODEL_FEATURES.map((f) => (
          <div className="form-row" key={f.key}>
            <label>
              {f.label}
              {f.hint ? <span style={{ fontWeight: "normal", color: "#666" }}> — {f.hint}</span> : null}
            </label>
            {f.type === "select" ? (
              <select name={f.key} className="form-input" value={bioData[f.key]} onChange={handleChange}>
                {f.options.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="number"
                name={f.key}
                className="form-input"
                step={f.step || "1"}
                value={bioData[f.key]}
                onChange={handleChange}
              />
            )}
          </div>
        ))}
      </div>

      <div className="button-group">
        <button className="submit-form-btn next-btn-blue" type="button" onClick={handleManualNext}>
          Continue with manual values
        </button>
        <button className="back-btn" type="button" onClick={handleUploadOnly}>
          Skip manual and upload report only
        </button>
      </div>
    </div>
  );
}
