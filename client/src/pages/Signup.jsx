import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../api";

function HeartArt() {
  return (
    <svg className="hero-art" viewBox="0 0 120 120" aria-hidden="true">
      <defs>
        <linearGradient id="hg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ff5fa2" />
          <stop offset="1" stopColor="#ff8a65" />
        </linearGradient>
      </defs>
      <circle cx="60" cy="60" r="56" fill="#fff" opacity="0.6" />
      <path
        d="M60 94 C20 66 22 36 42 34 C52 33 58 40 60 46 C62 40 68 33 78 34 C98 36 100 66 60 94 Z"
        fill="url(#hg)"
      />
      <circle cx="90" cy="26" r="8" fill="#ffd166" />
      <circle cx="24" cy="30" r="3" fill="#19c6b7" />
      <circle cx="98" cy="86" r="3" fill="#7c4dff" />
      <circle cx="26" cy="88" r="2.5" fill="#ffd166" />
    </svg>
  );
}

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      const data = await api("/auth/signup", {
        method: "POST",
        body: { name, email, password, consent },
      });
      localStorage.setItem("token", data.token);
      navigate("/log");
    } catch (err) {
      if (err.status === 409) {
        setError("This email is already registered. Please log in.");
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page">
      <div className="card">
        <HeartArt />
        <h1 className="title">Join HERTale 💖</h1>
        <p className="sub">
          Track your symptoms and share clear reports with your doctor.
        </p>

        <form onSubmit={handleSubmit}>
          <label className="label" htmlFor="name">Name</label>
          <input
            id="name"
            className="input"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <label className="label" htmlFor="email">Email</label>
          <input
            id="email"
            className="input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label className="label" htmlFor="password">
            Password (at least 6 characters)
          </label>
          <input
            id="password"
            className="input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <label
            style={{
              display: "flex",
              gap: 10,
              alignItems: "flex-start",
              fontSize: "0.85rem",
              marginBottom: 16,
            }}
          >
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              required
              style={{ accentColor: "#ff5fa2", width: 20, height: 20, marginTop: 2 }}
            />
            <span>
              I agree to let this app store my health logs. My data is private,
              and I can delete it any time from Settings.
            </span>
          </label>

          {error && <p className="error">{error}</p>}

          <button className="btn" type="submit" disabled={loading || !consent}>
            {loading ? "Creating account..." : "Sign up 🌷"}
          </button>
        </form>

        <p style={{ textAlign: "center" }}>
          Already have an account? <Link className="link" to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
}