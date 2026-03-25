import React, { useEffect, useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import API_BASE_URL from "../config";

const StatCard = ({ title, value, accent }) => (
  <div
    style={{
      padding: 20,
      borderRadius: 12,
      backgroundColor: "white",
      boxShadow: "0 4px 6px rgba(0,0,0,0.06)",
      borderLeft: `6px solid ${accent}`,
    }}
  >
    <h4 style={{ margin: 0, color: "#6b7280", fontSize: 14 }}>{title}</h4>
    <p style={{ fontSize: 28, fontWeight: 800, margin: "8px 0 0 0" }}>{value}</p>
  </div>
);

function parseRiskPct(risk) {
  if (risk == null) return null;
  if (typeof risk === "number") return risk;
  const s = String(risk).replace(/%/g, "").trim();
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

function riskBandFromPct(pct) {
  if (pct == null) return { label: "—", accent: "#6b7280" };
  if (pct < 30) return { label: "Low", accent: "#00A896" };
  if (pct < 70) return { label: "Moderate", accent: "#f59e0b" };
  return { label: "High", accent: "#ef4444" };
}

function parseDateForLabel(dateStr) {
  if (!dateStr) return null;
  // Backend returns: "YYYY-MM-DD HH:MM"
  const isoish = String(dateStr).replace(" ", "T");
  const d = new Date(isoish);
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

export default function Dashboard({ data }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const myUser = useMemo(() => {
    return (
      localStorage.getItem("userEmail") ||
      localStorage.getItem("userName") ||
      "Guest"
    );
  }, []);

  useEffect(() => {
    let alive = true;

    async function load() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`${API_BASE_URL}/api/history`);
        const payload = await res.json();
        if (!alive) return;
        if (!Array.isArray(payload)) {
          setHistory([]);
          return;
        }
        setHistory(payload);
      } catch (e) {
        if (!alive) return;
        setError("Failed to load prediction history from the database.");
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    }

    load();
    return () => {
      alive = false;
    };
  }, []);

  const derived = useMemo(() => {
    const meHistory = history
      .filter((x) => x && x.user === myUser)
      .map((x) => ({ ...x, risk: parseRiskPct(x.risk) }))
      .filter((x) => x.risk != null);

    const parseDate = (x) => parseDateForLabel(x.date)?.getTime() ?? 0;
    // API already sorts by newest, but sort again safely
    meHistory.sort((a, b) => parseDate(b) - parseDate(a));

    const liveRiskPct = parseRiskPct(data?.risk);
    const liveDate = data?.date || new Date();
    const liveEntry =
      liveRiskPct == null
        ? null
        : {
            user: myUser,
            risk: liveRiskPct,
            date:
              typeof liveDate === "string"
                ? liveDate
                : liveDate instanceof Date
                  ? liveDate.toISOString().replace("T", " ").slice(0, 16)
                  : String(new Date()).slice(0, 16),
          };

    const extended = liveEntry ? [liveEntry, ...meHistory] : meHistory;
    const latest = extended[0] || null;
    const band = riskBandFromPct(latest?.risk ?? null);

    const lastN = extended.slice(0, 7).reverse(); // chart oldest -> newest
    const avg =
      lastN.length > 0
        ? Math.round(lastN.reduce((sum, x) => sum + (x.risk ?? 0), 0) / lastN.length)
        : null;

    const chartData = lastN.map((x, idx) => {
      const d = parseDateForLabel(x.date);
      const label = d
        ? d.toLocaleDateString(undefined, { weekday: "short" })
        : `#${idx + 1}`;
      return { name: label, risk: x.risk };
    });

    return {
      latest,
      band,
      avgRiskPct: avg,
      predictionCount: extended.length,
      chartData,
    };
  }, [history, myUser, data]);

  return (
    <div style={{ padding: 0 }}>
      <h2 style={{ color: "#1A2B4B", marginBottom: 24, fontSize: 26 }}>
        Health Analytics Dashboard
      </h2>

      {loading ? (
        <p style={{ color: "#6b7280" }}>Loading risk data…</p>
      ) : error ? (
        <div style={{ background: "#ffebee", color: "#c62828", padding: 12, borderRadius: 10 }}>
          {error}
        </div>
      ) : derived.latest ? (
        <>
          {/* KPI Row */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 16,
              marginBottom: 24,
            }}
          >
            <StatCard
              title="Heart Risk"
              value={derived.band.label}
              accent={derived.band.accent}
            />
            <StatCard
              title="Avg Risk (last 7)"
              value={derived.avgRiskPct == null ? "—" : `${derived.avgRiskPct}%`}
              accent="#00A896"
            />
            <StatCard
              title="Predictions"
              value={derived.predictionCount}
              accent="#1E88E5"
            />
          </div>

          {/* Graph Section */}
          <div
            style={{
              backgroundColor: "white",
              padding: 20,
              borderRadius: 15,
              boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
            }}
          >
            <h3 style={{ color: "#1A2B4B", marginBottom: 12 }}>Risk Trend Analysis</h3>

            <div style={{ width: "100%", height: 300 }}>
              <ResponsiveContainer>
                <LineChart data={derived.chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="risk"
                    stroke="#00A896"
                    strokeWidth={3}
                    dot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      ) : (
        <div
          style={{
            background: "white",
            padding: 20,
            borderRadius: 15,
            border: "1px solid #eef2f6",
            color: "#6b7280",
          }}
        >
          No prediction history found for your account yet.
        </div>
      )}
    </div>
  );
}