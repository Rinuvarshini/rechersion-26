import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { api } from "../api";

// true = backend illama sample link. Backend ready aanadhum false aakkunga.
const USE_MOCK = false;

export default function ShareCard({ reportId }) {
  const [share, setShare] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  async function createLink() {
    setError("");
    setCopied(false);
    setLoading(true);
    try {
      if (USE_MOCK) {
        await new Promise((r) => setTimeout(r, 800));
        setShare({
          shareToken: "demo-share-token",
          expiresAt: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
        });
      } else {
        const data = await api(`/reports/${reportId}/share`, { method: "POST" });
        setShare(data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const url = share ? `${window.location.origin}/doctor/${share.shareToken}` : "";

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
    } catch {
      setError("Could not copy. Please copy the link by hand.");
    }
  }

  return (
    <div className="card no-print" style={{ marginBottom: 20, textAlign: "center" }}>
      <h3 style={{ marginTop: 0, color: "#7c4dff" }}>Share with your doctor 🔗</h3>
      <p>
        Create a private link. Your doctor can open it without logging in. It stops
        working after 24 hours.
      </p>

      {error && <p className="error">{error}</p>}

      {!share && (
        <button
          className="btn"
          style={{ width: "auto", padding: "12px 28px" }}
          onClick={createLink}
          disabled={loading}
        >
          {loading ? "Creating link..." : "Create share link ✨"}
        </button>
      )}

      {share && (
        <div style={{ animation: "fadeUp 0.6s ease both" }}>
          <div
            style={{
              display: "inline-block",
              padding: 16,
              background: "#fff",
              borderRadius: 20,
              border: "4px solid #ff5fa2",
              boxShadow: "0 12px 30px rgba(255,95,162,0.35)",
            }}
          >
            <QRCodeSVG value={url} size={180} fgColor="#7c4dff" />
          </div>

          <p style={{ fontSize: "0.85rem", wordBreak: "break-all" }}>{url}</p>
          <p style={{ fontSize: "0.85rem" }}>
            ⏰ Link expires: {new Date(share.expiresAt).toLocaleString()}
          </p>

          <button
            style={{
              background: "#fff",
              border: "2px solid #7c4dff",
              color: "#7c4dff",
              borderRadius: 999,
              padding: "10px 18px",
              fontWeight: 600,
              cursor: "pointer",
              font: "inherit",
            }}
            onClick={copyLink}
          >
            {copied ? "Copied ✅" : "Copy link 📋"}
          </button>
        </div>
      )}
    </div>
  );
}