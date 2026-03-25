import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Form.css";
import API_BASE_URL from "../config";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        alert(data.message || "Admin login failed");
        return;
      }
      localStorage.setItem("adminToken", data.token);
      navigate("/admin", { replace: true });
    } catch (err) {
      const base = API_BASE_URL || "(dev proxy → http://127.0.0.1:5000)";
      alert(
        `Cannot reach the API (${base}).\n\n` +
          "Start Flask from a terminal:\n" +
          "  cd app/backend\n" +
          "  python app.py\n\n" +
          `Details: ${err?.message || err}`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card" style={{ maxWidth: 420, margin: "48px auto" }}>
      <h3 className="form-title">Admin Login</h3>
      <p style={{ fontSize: 13, color: "#666", marginBottom: 16 }}>
        Monitor registered users and prediction records. Use the exact{" "}
        <code style={{ fontSize: 12 }}>ADMIN_EMAIL</code> and{" "}
        <code style={{ fontSize: 12 }}>ADMIN_PASSWORD</code> from backend{" "}
        <code style={{ fontSize: 12 }}>.env</code>. Flask must be running on port 5000.
      </p>
      <p style={{ fontSize: 12, color: "#888", marginBottom: 16 }}>
        API: {API_BASE_URL || "same origin (dev proxy → 127.0.0.1:5000)"}
      </p>
      <form onSubmit={handleSubmit} className="neat-form-list">
        <div className="form-row">
          <label>Admin email</label>
          <input
            type="email"
            name="email"
            className="form-input"
            value={form.email}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-row">
          <label>Admin password</label>
          <input
            type="password"
            name="password"
            className="form-input"
            value={form.password}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit" className="next-btn" disabled={loading}>
          {loading ? "Signing in…" : "Sign in to admin"}
        </button>
      </form>
      <p className="auth-footer">
        <span className="link-text" onClick={() => navigate("/login")}>
          Patient login
        </span>
      </p>
    </div>
  );
}
