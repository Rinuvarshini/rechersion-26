import { useState } from "react";
import { api } from "../api";

// true = backend illama test panna. Backend ready aanadhum false aakkunga.
const USE_MOCK = false;

const emptyDraft = {
  symptoms: [],
  flow: null,
  mood: "",
  sleepHours: "",
  notes: "",
};

const FLOW_OPTIONS = [
  { value: "none", label: "None", color: "#19c6b7" },
  { value: "light", label: "Light", color: "#ffd166" },
  { value: "medium", label: "Medium", color: "#ff8a65" },
  { value: "heavy", label: "Heavy", color: "#ff5fa2" },
];

const ghostBtn = {
  background: "#fff",
  border: "2px solid #ff5fa2",
  color: "#ff5fa2",
  borderRadius: 999,
  padding: "8px 16px",
  fontWeight: 600,
  cursor: "pointer",
  font: "inherit",
};

function DropArt() {
  return (
    <svg className="hero-art" viewBox="0 0 120 120" aria-hidden="true">
      <defs>
        <linearGradient id="dg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ff5fa2" />
          <stop offset="1" stopColor="#7c4dff" />
        </linearGradient>
      </defs>
      <circle cx="60" cy="60" r="56" fill="#fff" opacity="0.6" />
      <path
        d="M60 20 C60 20 34 54 34 72 A26 26 0 0 0 86 72 C86 54 60 20 60 20 Z"
        fill="url(#dg)"
      />
      <ellipse cx="50" cy="68" rx="5" ry="9" fill="#fff" opacity="0.5" transform="rotate(20 50 68)" />
      <circle cx="94" cy="28" r="6" fill="#ffd166" />
      <circle cx="24" cy="36" r="3" fill="#19c6b7" />
      <circle cx="98" cy="88" r="3" fill="#ff8a65" />
    </svg>
  );
}

export default function Log() {
  const [text, setText] = useState("");
  const [draft, setDraft] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  async function handleUnderstand() {
    setError("");
    setSaved(false);
    setLoading(true);
    try {
      if (USE_MOCK) {
        await new Promise((r) => setTimeout(r, 800));
        setDraft({
          symptoms: [
            { name: "cramps", severity: 8, bodyArea: "lower left side" },
            { name: "fatigue", severity: 5, bodyArea: "" },
          ],
          flow: "heavy",
          mood: "very low",
          sleepHours: 4,
          notes: "",
        });
      } else {
        const data = await api("/logs/parse", {
          method: "POST",
          body: { text },
        });
        const p = data.parsed || {};
        setDraft({
          symptoms: (p.symptoms || []).map((s) => ({
            name: s.name || "",
            severity: s.severity ?? 0,
            bodyArea: s.bodyArea || "",
          })),
          flow: p.flow ?? null,
          mood: p.mood ?? "",
          sleepHours: p.sleepHours ?? "",
          notes: p.notes ?? "",
        });
      }
    } catch (err) {
      if (err.status === 429) {
        setError("Please wait a minute and try again.");
      } else {
        setError("We couldn't read that automatically. Please fill in the form below.");
        setDraft(emptyDraft);
      }
    } finally {
      setLoading(false);
    }
  }

  function updateSymptom(index, field, value) {
    setDraft((d) => ({
      ...d,
      symptoms: d.symptoms.map((s, i) =>
        i === index ? { ...s, [field]: value } : s
      ),
    }));
  }

  function addSymptom() {
    setDraft((d) => ({
      ...d,
      symptoms: [...d.symptoms, { name: "", severity: 0, bodyArea: "" }],
    }));
  }

  function removeSymptom(index) {
    setDraft((d) => ({
      ...d,
      symptoms: d.symptoms.filter((_, i) => i !== index),
    }));
  }

  async function handleSave() {
    setError("");
    setLoading(true);
    try {
      const body = {
        symptoms: draft.symptoms,
        flow: draft.flow || null,
        mood: draft.mood || null,
        sleepHours: draft.sleepHours === "" ? null : Number(draft.sleepHours),
        notes: draft.notes,
        rawText: text,
      };
      if (!USE_MOCK) {
        await api("/logs", { method: "POST", body });
      } else {
        await new Promise((r) => setTimeout(r, 500));
      }
      setSaved(true);
      setDraft(null);
      setText("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page" style={{ maxWidth: 520 }}>
      <div className="card">
        <DropArt />
        <h1 className="title">How are you feeling today? 🌙</h1>
        <p className="sub">Tell us in your own words. We will help organise it.</p>

        {saved && (
          <p
            style={{
              background: "#d9f7f3",
              color: "#0b7f75",
              padding: "10px 14px",
              borderRadius: 12,
            }}
          >
            Saved! Your log has been added 🎉
          </p>
        )}
        {error && <p className="error">{error}</p>}

        {!draft && (
          <>
            <label className="label" htmlFor="logtext">Your day</label>
            <textarea
              id="logtext"
              className="input"
              rows={5}
              maxLength={1000}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Example: Bad cramps on my lower left side, slept only 4 hours, feeling very low."
            />
            <button
              className="btn"
              onClick={handleUnderstand}
              disabled={loading || text.trim() === ""}
            >
              {loading ? "Understanding..." : "Understand ✨"}
            </button>
            <p style={{ textAlign: "center" }}>
              <button style={ghostBtn} onClick={() => setDraft(emptyDraft)}>
                Fill the form manually instead
              </button>
            </p>
          </>
        )}

        {draft && (
          <div>
            <h2 style={{ color: "#7c4dff" }}>Please check your log</h2>

            <h3>Symptoms</h3>
            {draft.symptoms.map((s, i) => (
              <div
                key={i}
                style={{
                  background: "#fff",
                  borderLeft: "6px solid #ff5fa2",
                  borderRadius: 16,
                  padding: 14,
                  marginBottom: 14,
                  boxShadow: "0 6px 18px rgba(124,77,255,0.12)",
                }}
              >
                <label className="label">Symptom</label>
                <input
                  className="input"
                  value={s.name}
                  onChange={(e) => updateSymptom(i, "name", e.target.value)}
                />
                <label className="label">Severity: {s.severity} / 10</label>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={s.severity}
                  onChange={(e) => updateSymptom(i, "severity", Number(e.target.value))}
                  style={{ width: "100%", accentColor: "#ff5fa2", marginBottom: 16 }}
                />
                <label className="label">Body area (optional)</label>
                <input
                  className="input"
                  value={s.bodyArea}
                  onChange={(e) => updateSymptom(i, "bodyArea", e.target.value)}
                />
                <button style={ghostBtn} onClick={() => removeSymptom(i)}>
                  Remove
                </button>
              </div>
            ))}
            <button style={ghostBtn} onClick={addSymptom}>+ Add symptom</button>

            <h3>Flow</h3>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
              {FLOW_OPTIONS.map((f) => {
                const on = draft.flow === f.value;
                return (
                  <button
                    key={f.value}
                    onClick={() => setDraft({ ...draft, flow: on ? null : f.value })}
                    style={{
                      padding: "10px 18px",
                      borderRadius: 999,
                      border: `2px solid ${f.color}`,
                      background: on ? f.color : "#fff",
                      color: on ? "#fff" : "#2b1b4a",
                      fontWeight: 600,
                      cursor: "pointer",
                      font: "inherit",
                      transition: "0.2s",
                      transform: on ? "scale(1.08)" : "none",
                    }}
                  >
                    {f.label}
                  </button>
                );
              })}
            </div>

            <label className="label" htmlFor="mood">Mood</label>
            <input
              id="mood"
              className="input"
              value={draft.mood}
              onChange={(e) => setDraft({ ...draft, mood: e.target.value })}
            />

            <label className="label" htmlFor="sleep">Sleep (hours)</label>
            <input
              id="sleep"
              className="input"
              type="number"
              min="0"
              max="24"
              step="0.5"
              value={draft.sleepHours}
              onChange={(e) => setDraft({ ...draft, sleepHours: e.target.value })}
            />

            <label className="label" htmlFor="notes">Notes (optional)</label>
            <textarea
              id="notes"
              className="input"
              rows={3}
              value={draft.notes}
              onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
            />

            <button className="btn" onClick={handleSave} disabled={loading}>
              {loading ? "Saving..." : "Save log 💾"}
            </button>
            <p style={{ textAlign: "center" }}>
              <button style={ghostBtn} onClick={() => setDraft(null)}>Go back</button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}