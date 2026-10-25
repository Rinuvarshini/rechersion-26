import { useEffect, useState } from "react";
import { api } from "../api";
import ShareCard from "../components/ShareCard";

// true = backend illama sample report. Backend ready aanadhum false aakkunga.
const USE_MOCK = false;

const MOCK_REPORT = {
  _id: "mock1",
  periodDays: 90,
  usedAI: true,
  summary:
    "Over the last 90 days you logged 72 times. Cramps and fatigue showed up most often, usually around the start of your period. Sleep was lower on the days pain was higher.",
  disclaimer:
    "This report is a summary of what you logged. It is not a medical diagnosis. Please discuss it with your doctor.",
  flags: [
    {
      title: "Heavy flow on several days",
      evidence: "Heavy flow was logged on 9 days across 3 cycles.",
      discuss: "Ask your doctor whether this amount of flow is expected for you.",
    },
    {
      title: "Pain and low sleep go together",
      evidence: "Average sleep was 4.8 hours on days with pain above 6.",
      discuss: "Ask whether sleep and pain could be linked for you.",
    },
    {
      title: "Cycle length varies",
      evidence: "Your cycles were 26, 31 and 28 days long.",
      discuss: "Ask whether this range is normal for you.",
    },
  ],
  doctorQuestions: [
    "Is the cramping I get each cycle within the normal range?",
    "Could my low sleep be making my pain worse?",
    "Should I get any tests done for heavy flow?",
  ],
  stats: {
    totalLogs: 72,
    from: "2026-07-27",
    to: "2026-10-24",
    cyclesDetected: 3,
    avgCycleLength: 28,
    avgSleep: 6.1,
    topSymptoms: [
      { name: "cramps", days: 24, avgSeverity: 6.5 },
      { name: "fatigue", days: 19, avgSeverity: 4.2 },
      { name: "headache", days: 8, avgSeverity: 3.8 },
    ],
  },
};

const FLAG_COLORS = ["#ff5fa2", "#7c4dff", "#19c6b7", "#ff8a65"];

function ReportArt() {
  return (
    <svg className="hero-art" viewBox="0 0 120 120" aria-hidden="true">
      <circle cx="60" cy="60" r="56" fill="#fff" opacity="0.6" />
      <rect x="32" y="22" width="56" height="76" rx="10" fill="#fff" stroke="#7c4dff" strokeWidth="3" />
      <rect x="46" y="16" width="28" height="12" rx="6" fill="#7c4dff" />
      <rect x="42" y="44" width="36" height="5" rx="2.5" fill="#ff5fa2" />
      <rect x="42" y="56" width="28" height="5" rx="2.5" fill="#19c6b7" />
      <rect x="42" y="68" width="32" height="5" rx="2.5" fill="#ffd166" />
      <path
        d="M60 90 C48 82 48 74 54 74 C57 74 59 76 60 78 C61 76 63 74 66 74 C72 74 72 82 60 90 Z"
        fill="#ff5fa2"
      />
    </svg>
  );
}

const ghostBtn = {
  background: "#fff",
  border: "2px solid #ff5fa2",
  color: "#ff5fa2",
  borderRadius: 999,
  padding: "10px 18px",
  fontWeight: 600,
  cursor: "pointer",
  font: "inherit",
};

export default function Report() {
  const [report, setReport] = useState(null);
  const [days, setDays] = useState(90);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        if (!USE_MOCK) {
          setReport(await api("/reports/latest"));
        }
      } catch (err) {
        if (err.status !== 404) setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function generate() {
    setError("");
    setGenerating(true);
    try {
      if (USE_MOCK) {
        await new Promise((r) => setTimeout(r, 2000));
        setReport({ ...MOCK_REPORT, periodDays: days });
      } else {
        const r = await api("/reports/generate", {
          method: "POST",
          body: { days },
        });
        setReport(r);
      }
    } catch (err) {
      if (err.status === 400) {
        setError("Please add at least 3 logs first, then try again.");
      } else if (err.status === 429) {
        setError("Please wait a minute and try again.");
      } else {
        setError(err.message);
      }
    } finally {
      setGenerating(false);
    }
  }

  if (loading) return <p style={{ padding: 16 }}>Loading... 🌸</p>;

  const s = report?.stats;

  return (
    <div className="page" style={{ maxWidth: 720 }}>
      <style>{`
        @media print {
          nav, .no-print, body::before, body::after { display: none !important; }
          body { background: #fff !important; }
          .card { box-shadow: none !important; background: #fff !important; }
        }
      `}</style>

      <ReportArt />
      <h1 className="title">Your doctor report 📋</h1>
      <p className="sub">A clear summary you can show your doctor.</p>

      {error && <p className="error">{error}</p>}

      <div
        className="no-print"
        style={{
          display: "flex",
          gap: 10,
          flexWrap: "wrap",
          justifyContent: "center",
          alignItems: "center",
          marginBottom: 20,
        }}
      >
        <label htmlFor="days" style={{ fontWeight: 600 }}>Period:</label>
        <select
          id="days"
          value={days}
          onChange={(e) => setDays(Number(e.target.value))}
          style={{ padding: 10, borderRadius: 12, border: "2px solid #7c4dff", font: "inherit" }}
        >
          <option value={30}>Last 30 days</option>
          <option value={90}>Last 90 days</option>
          <option value={180}>Last 180 days</option>
        </select>
        <button
          className="btn"
          style={{ width: "auto", padding: "12px 24px" }}
          onClick={generate}
          disabled={generating}
        >
          {generating ? "Creating your report... ✨" : report ? "Regenerate ✨" : "Generate report ✨"}
        </button>
        {report && (
          <button style={ghostBtn} onClick={() => window.print()}>
            🖨️ Print / Save as PDF
          </button>
        )}
      </div>

      {!report && !generating && (
        <div className="card" style={{ textAlign: "center" }}>
          <p>No report yet. Press <b>Generate report</b> to create one from your logs 🌱</p>
        </div>
      )}

      {report && (
        <>
          <div className="card" style={{ marginBottom: 20 }}>
            <h3 style={{ marginTop: 0, color: "#7c4dff" }}>Summary 📝</h3>
            <p>{report.summary}</p>
            {s && (
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {[
                  ["Logs", s.totalLogs, "#ff5fa2"],
                  ["Cycles", s.cyclesDetected, "#7c4dff"],
                  ["Avg cycle", s.avgCycleLength ? `${s.avgCycleLength} d` : "-", "#19c6b7"],
                  ["Avg sleep", s.avgSleep ? `${s.avgSleep} h` : "-", "#ff8a65"],
                ].map(([label, value, color]) => (
                  <div
                    key={label}
                    style={{
                      flex: 1,
                      minWidth: 90,
                      background: color,
                      color: "#fff",
                      borderRadius: 16,
                      padding: 12,
                      textAlign: "center",
                    }}
                  >
                    <div style={{ fontSize: "0.8rem" }}>{label}</div>
                    <div style={{ fontSize: "1.3rem", fontWeight: 700 }}>{value}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {s?.topSymptoms?.length > 0 && (
            <div className="card" style={{ marginBottom: 20 }}>
              <h3 style={{ marginTop: 0, color: "#7c4dff" }}>Most common symptoms 💜</h3>
              {s.topSymptoms.map((t) => (
                <div key={t.name} style={{ marginBottom: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <b style={{ textTransform: "capitalize" }}>{t.name}</b>
                    <span>{t.days} days, avg {t.avgSeverity}/10</span>
                  </div>
                  <div style={{ background: "#eadcff", borderRadius: 999, height: 10 }}>
                    <div
                      style={{
                        width: `${Math.min(100, (t.avgSeverity / 10) * 100)}%`,
                        height: 10,
                        borderRadius: 999,
                        background: "linear-gradient(90deg,#7c4dff,#ff5fa2)",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          <ShareCard reportId={report._id} />

          <h3 style={{ color: "#7c4dff" }}>Patterns worth discussing 🔎</h3>
          {(report.flags || []).map((f, i) => (
            <div
              key={i}
              className="card"
              style={{
                marginBottom: 14,
                borderLeft: `8px solid ${FLAG_COLORS[i % FLAG_COLORS.length]}`,
                padding: 16,
              }}
            >
              <b>{f.title}</b>
              <p style={{ margin: "6px 0" }}>{f.evidence}</p>
              <p style={{ margin: 0, color: FLAG_COLORS[i % FLAG_COLORS.length], fontWeight: 600 }}>
                💬 {f.discuss}
              </p>
            </div>
          ))}

          <div className="card" style={{ marginBottom: 20 }}>
            <h3 style={{ marginTop: 0, color: "#7c4dff" }}>Questions for your doctor 🩺</h3>
            <ol>
              {(report.doctorQuestions || []).map((q, i) => (
                <li key={i} style={{ marginBottom: 8 }}>{q}</li>
              ))}
            </ol>
          </div>

          <p
            style={{
              background: "#fff3cd",
              padding: 14,
              borderRadius: 14,
              fontSize: "0.9rem",
            }}
          >
            ⚠️ {report.disclaimer}
          </p>
        </>
      )}
    </div>
  );
}