import React from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import "./UserLayout.css";

const links = [
  { to: "/home", label: "Home" },
  { to: "/dashboard", label: "Dashboard" },
  { to: "/bio", label: "Predict" },
  { to: "/report-upload", label: "Upload" },
  { to: "/results", label: "Results" },
  { to: "/history", label: "History" },
  { to: "/recommendations", label: "Recommendations" },
  { to: "/settings", label: "Settings" },
];

export default function UserLayout() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userName");
    localStorage.removeItem("userId");
    localStorage.removeItem("patientId");
    navigate("/login");
  };

  return (
    <div className="user-layout-root">
      <header className="user-layout-header">
        <div className="user-layout-brand">HeartAI</div>
        <nav className="user-layout-nav">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `user-layout-link ${isActive ? "active" : ""}`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>
        <button type="button" className="user-layout-logout" onClick={logout}>
          Logout
        </button>
      </header>

      <main className="user-layout-content">
        <Outlet />
      </main>
    </div>
  );
}
