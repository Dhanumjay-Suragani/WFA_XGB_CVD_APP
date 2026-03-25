import React from "react";
import { NavLink, Outlet } from "react-router-dom";
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
      </header>

      <main className="user-layout-content">
        <Outlet />
      </main>
    </div>
  );
}
