import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";

// true = backend illama sample data. Backend ready aanadhum false aakkunga.
const USE_MOCK = false;

function ShieldArt() {
  return (
    <svg className="hero-art" viewBox="0 0 120 120" aria-hidden="true">
      <defs>
        <linearGradient id="sg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#7c4dff" />
          <stop offset="1" stopColor="#19c6b7" />
        </linearGradient>
      </defs>
      <circle cx="60" cy="60" r="56" fill="#fff" opacity="0.6" />
      <path
        d="M60 18 L90 30 V58 C90 78 76 92 60 100 C44 92 30 78 30 58 V30 Z"
        fill="url(#sg)"
      />
      <path
        d="M60 78 C48 70 48 60 54 60 C57 60 59 62 60 64 C61 62 63 60 66 60 C72 60 72 70 60 78 Z"
        fill="#fff"
      />
      <circle cx="96" cy="28" r="4" fill="#ffd166" />
      <circle cx="22" cy="40" r="3" fill="#ff5fa2" />
    </svg>
  );
}

const dangerBtn = {
  width: "100%",
  padding: 14,
  border: "none",
  borderRadius: 999,
  background: "linear-gradient(90deg, #ff5fa2, #d6336c)",
  color: "#fff",
  fontWeight: 600,
  cursor: "pointer",
  font: "inherit",
  boxShadow: "0 10px 24px rgba(214,51,108,0.35)",
};

const ghostBtn = {
  background: "#fff",
  border: "2px solid #7c4dff",
  color: "#7c4dff",
  borderRadius: 999,
  padding: "10px 18px",
  fontWeight: 600,
  cursor: "pointer",
  font: "inherit",
};

export default function Settings() {
  const navigate = useNavigate();
  const [me, setMe] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [confirm, setConfirm] = useState(null); // "data" or "account"
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        if (USE_MOCK) {
          setMe({
            name: "Demo User",
            email: "demo@example.com",
            consentGivenAt: new Date().toISOString(),
          });
        } else {
          setMe(await api("/me"));
        }
      } catch (err) {
        setError(err.message);
      }
    }
    load();
  }, []);

  async function deleteData() {
    setError("");
    setMessage("");
    setBusy(true);
    try {
      if (USE_MOCK) {
        await new Promise((r) => setTimeout(r, 800));
        setMessage("All your logs and reports were deleted.");
      } else {
        const r = await api("/me/data", { method: "DELETE" });
        setMessage(
          `Deleted ${r.deletedLogs} logs and ${r.deletedReports} reports. Any share links no longer work.`
        );
      }
      setConfirm(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function deleteAccount() {
    setError("");
    setBusy(true);
    try {
      if (USE_MOCK) {
        await new Promise((r) => setTimeout(r, 800));
      } else {
        await api("/me", { method: "DELETE", body: { password } });
      }
      localStorage.removeItem("token");
      navigate("/signup");
    } catch (err) {
      setError(err.status === 401 ? "That password is not correct." : err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="page" style={{ maxWidth: 560 }}>
      <ShieldArt />
      <h1 className="title">Privacy & settings 🛡️</h1>
      <p className="sub">Your health data belongs to you.</p>

      {message && (
        <p
          style={{
            background: "#d9f7f3",
            color: "#0b7f75",
            padding: "10px 14px",
            borderRadius: 12,
          }}
        >
          ✅ {message}
        </p>
      )}
      {error && <p className="error">{error}</p>}

      <div className="card" style={{ marginBottom: 20 }}>
        <h3 style={{ marginTop: 0, color: "#7c4dff" }}>Your account 👤</h3>
        {me ? (
          <>
            <p><b>Name:</b> {me.name}</p>
            <p><b>Email:</b> {me.email}</p>
            {me.consentGivenAt && (
              <p style={{ fontSize: "0.85rem" }}>
                Consent given on {new Date(me.consentGivenAt).toLocaleDateString()}
              </p>
            )}
          </>
        ) : (
          <p>Loading...</p>
        )}
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <h3 style={{ marginTop: 0, color: "#7c4dff" }}>How we protect you 🔒</h3>
        <ul style={{ paddingLeft: 20, lineHeight: 1.8 }}>
          <li>Your logs are private to your account.</li>
          <li>Nothing is saved until you confirm it.</li>
          <li>Doctor links stop working after 24 hours.</li>
          <li>You can delete everything, any time.</li>
        </ul>
      </div>

      <div
        className="card"
        style={{ border: "2px solid #ff5fa2", marginBottom: 20 }}
      >
        <h3 style={{ marginTop: 0, color: "#d6336c" }}>Delete my data 🗑️</h3>
        <p>
          This removes all your logs and reports. Your account stays. Share
          links stop working. This cannot be undone.
        </p>

        {confirm !== "data" ? (
          <button style={dangerBtn} onClick={() => setConfirm("data")}>
            Delete all my data
          </button>
        ) : (
          <div>
            <p><b>Are you sure?</b> Everything you logged will be gone.</p>
            <div style={{ display: "flex", gap: 10 }}>
              <button style={dangerBtn} onClick={deleteData} disabled={busy}>
                {busy ? "Deleting..." : "Yes, delete"}
              </button>
              <button style={ghostBtn} onClick={() => setConfirm(null)}>
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <h3 style={{ marginTop: 0, color: "#d6336c" }}>Delete my account ⚠️</h3>
        <p>This removes your account and all data. Enter your password to confirm.</p>

        {confirm !== "account" ? (
          <button style={ghostBtn} onClick={() => setConfirm("account")}>
            I want to delete my account
          </button>
        ) : (
          <div>
            <label className="label" htmlFor="pw">Password</label>
            <input
              id="pw"
              className="input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <div style={{ display: "flex", gap: 10 }}>
              <button
                style={dangerBtn}
                onClick={deleteAccount}
                disabled={busy || (!USE_MOCK && password === "")}
              >
                {busy ? "Deleting..." : "Delete my account"}
              </button>
              <button style={ghostBtn} onClick={() => setConfirm(null)}>
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}