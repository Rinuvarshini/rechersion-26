import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../api";

function Lotus() {
  return (
    <svg className="hero-art" viewBox="0 0 120 120" aria-hidden="true">
      <defs>
        <linearGradient id="pet" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ff5fa2" />
          <stop offset="1" stopColor="#7c4dff" />
        </linearGradient>
      </defs>
      <circle cx="60" cy="60" r="56" fill="#fff" opacity="0.6" />
      <ellipse cx="60" cy="62" rx="13" ry="32" fill="#ff8a65" transform="rotate(-50 60 88)" />
      <ellipse cx="60" cy="62" rx="13" ry="32" fill="#ffd166" transform="rotate(50 60 88)" />
      <ellipse cx="60" cy="62" rx="14" ry="34" fill="url(#pet)" />
      <path d="M60 94 C60 102 60 106 60 112" stroke="#19c6b7" strokeWidth="4" strokeLinecap="round" fill="none" />
      <circle cx="60" cy="36" r="5" fill="#fff" />
    </svg>
  );
}

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await api("/auth/login", {
        method: "POST",
        body: { email, password },
      });
      localStorage.setItem("token", data.token);
      navigate("/log");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page">
      <div className="card">
        <Lotus />
        <h1 className="title">Welcome back 🌸</h1>
        <p className="sub">Log in to continue tracking your health.</p>

        <form onSubmit={handleSubmit}>
          <label className="label" htmlFor="email">Email</label>
          <input
            id="email"
            className="input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label className="label" htmlFor="password">Password</label>
          <input
            id="password"
            className="input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && <p className="error">{error}</p>}

          <button className="btn" type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Log in ✨"}
          </button>
        </form>

        <p style={{ textAlign: "center" }}>
          New here? <Link className="link" to="/signup">Create an account</Link>
        </p>
      </div>
    </div>
  );
}