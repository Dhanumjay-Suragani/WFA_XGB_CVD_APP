const trimSlash = (s) => (s || "").trim().replace(/\/$/, "");

/**
 * API base URL for fetch().
 * - In development, default is "" so requests go to the React dev server and CRA "proxy"
 *   forwards them to Flask on port 5000 (see package.json "proxy").
 * - Set REACT_APP_API_BASE_URL if you need a fixed origin (e.g. testing from another device).
 * - Production build defaults to http://127.0.0.1:5000 if env is unset.
 */
const explicit = trimSlash(process.env.REACT_APP_API_BASE_URL);
const API_BASE_URL =
  explicit ||
  (process.env.NODE_ENV === "development" ? "" : "http://127.0.0.1:5000");

export default API_BASE_URL;
