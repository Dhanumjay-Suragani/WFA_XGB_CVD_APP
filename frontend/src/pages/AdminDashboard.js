import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Admin.css";
import { adminFetch, clearAdminSession, getAdminToken } from "../services/adminApi";

const tabs = [
  { id: "overview", label: "Overview" },
  { id: "users", label: "Registered users" },
  { id: "patients", label: "Predictions" },
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("overview");
  const [summary, setSummary] = useState(null);
  const [users, setUsers] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const requireToken = useCallback(() => {
    if (!getAdminToken()) {
      navigate("/admin/login", { replace: true });
      return false;
    }
    return true;
  }, [navigate]);

  const loadOverview = useCallback(async () => {
    const data = await adminFetch("/api/admin/summary");
    setSummary(data.counts || null);
  }, []);

  const loadUsers = useCallback(async () => {
    const data = await adminFetch("/api/admin/users");
    setUsers(data.data || []);
  }, []);

  const loadPatients = useCallback(async () => {
    const data = await adminFetch("/api/admin/patients");
    setPatients(data.data || []);
  }, []);

  useEffect(() => {
    if (!requireToken()) return;

    const run = async () => {
      setError("");
      setLoading(true);
      try {
        await loadOverview();
        await loadUsers();
        await loadPatients();
      } catch (e) {
        if (e.status === 401) {
          clearAdminSession();
          navigate("/admin/login", { replace: true });
          return;
        }
        setError(e.message || "Failed to load admin data");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [navigate, requireToken, loadOverview, loadUsers, loadPatients]);

  const handleLogout = () => {
    clearAdminSession();
    navigate("/admin/login", { replace: true });
  };

  const refreshTab = async () => {
    if (!requireToken()) return;
    setError("");
    try {
      if (tab === "overview") await loadOverview();
      if (tab === "users") await loadUsers();
      if (tab === "patients") await loadPatients();
    } catch (e) {
      setError(e.message || "Refresh failed");
    }
  };

  return (
    <div className="admin-shell">
      <header className="admin-topbar">
        <h1>HeartAI — Admin</h1>
        <div className="admin-topbar-actions">
          <button type="button" onClick={refreshTab}>
            Refresh
          </button>
          <button type="button" onClick={() => navigate("/login")}>
            Patient app
          </button>
          <button type="button" onClick={handleLogout}>
            Sign out
          </button>
        </div>
      </header>

      <div className="admin-tabs">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            className={tab === t.id ? "active" : ""}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="admin-body">
        {error ? <div className="admin-error">{error}</div> : null}

        {loading ? (
          <p>Loading…</p>
        ) : (
          <>
            {tab === "overview" && summary && (
              <div className="admin-stats">
                <div className="admin-stat-card">
                  <strong>{summary.users}</strong>
                  <span>Registered users</span>
                </div>
                <div className="admin-stat-card">
                  <strong>{summary.patients}</strong>
                  <span>Prediction records</span>
                </div>
                <div className="admin-stat-card">
                  <strong>{summary.otp_records}</strong>
                  <span>OTP records (password reset)</span>
                </div>
              </div>
            )}

            {tab === "overview" && !summary && !error ? (
              <p>No summary available.</p>
            ) : null}

            {tab === "users" && (
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Username</th>
                      <th>Email</th>
                      <th>Patient ID</th>
                      <th>Registered</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.length === 0 ? (
                      <tr>
                        <td colSpan={4}>No users yet.</td>
                      </tr>
                    ) : (
                      users.map((u) => (
                        <tr key={u.id}>
                          <td>{u.username}</td>
                          <td>{u.email}</td>
                          <td>{u.patient_id}</td>
                          <td>
                            {u.created_at
                              ? new Date(u.created_at).toLocaleString()
                              : "—"}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {tab === "patients" && (
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>User</th>
                      <th>Age</th>
                      <th>BP</th>
                      <th>Chol</th>
                      <th>Smoking</th>
                      <th>Risk</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {patients.length === 0 ? (
                      <tr>
                        <td colSpan={8}>No prediction records yet.</td>
                      </tr>
                    ) : (
                      patients.map((p) => (
                        <tr key={p._id}>
                          <td>{p.date || "—"}</td>
                          <td>{p.user ?? "—"}</td>
                          <td>{p.age}</td>
                          <td>{p.bp}</td>
                          <td>{p.chol}</td>
                          <td>{p.smoking}</td>
                          <td>{p.risk != null ? `${p.risk}%` : "—"}</td>
                          <td
                            className={
                              p.status === "High Risk"
                                ? "high"
                                : p.status === "Moderate Risk"
                                ? "moderate"
                                : "low"
                            }
                          >
                            {p.status}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
