import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../api";

// true = backend illama sample report. Backend ready aanadhum false aakkunga.
const USE_MOCK = true;

const MOCK_REPORT = {
  summary:
    "Over the last 90 days the patient logged 72 times. Cramps and fatigue showed up most often, usually around the start of the period. Sleep was lower on the days pain was higher.",
  disclaimer:
    "This report is a summary of what the patient logged. It is not a medical diagnosis. Please use your clinical judgement.",
  generatedAt: new Date().toISOString(),
  expiresAt: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
  flags: [
    {
      title: "Heavy flow on several days",
      evidence: "Heavy flow was logged on 9 days across 3 cycles.",
      discuss: "Worth discussing whether this amount of flow is expected.",
    },
    {
      title: "Pain and low sleep go together",
      evidence: "Average sleep was 4.8 hours on days with pain above 6.",
      discuss: "Worth discussing whether sleep and pain are linked.",
    },
    {
      title: "Cycle length varies",
      evidence: "Cycles were 26, 31 and 28 days long.",
      discuss: "Worth discussing whether this range is normal.",
    },
  ],
  doctorQuestions: [
    "Is the cramping each cycle within the normal range?",
    "Could low sleep be making the pain worse?",
    "Should any tests be done for heavy flow?",
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

function StethoArt() {
  return (
    <svg className="hero-art" viewBox="0 0 120 120" aria-hidden="true">
      <circle cx="60" cy="60" r="56" fill="#fff" opacity="0.6" />
      <path
        d="M36 28 V50 A24 24 0 0 0 84 50 V28"
        stroke="#7c4dff"
        strokeWidth="6"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M60 74 V84 A14 14 0 0 0 88 84 V72"
        stroke="#7c4dff"
        strokeWidth="6"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="88" cy="68" r="9" fill="#ff5fa2" />
      <circle cx="36" cy="26" r="5" fill="#19c6b7" />
      <circle cx="84" cy="26" r="5" fill="#19c6b7" />
    </svg>
  );
}

export default function DoctorView() {
  const { token } = useParams();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expired, setExpired] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        if (USE_MOCK) {
          setReport(MOCK_REPORT);
        } else {
          setReport(await api(`/reports/share/${token}`));
        }
      } catch (err) {
        if (err.status === 404) setExpired(true);
        else setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [token]);

  if (loading) return <p style={{ padding: 16 }}>Loading report... 🌸</p>;

  if (expired) {
    return (
      <div className="page">
        <div className="card" style={{ textAlign: "center" }}>
          <h1 className="title">This link has expired ⏰</h1>
          <p>Please ask the patient to create a new share link.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page">
        <p className="error">{error}</p>
      </div>
    );
  }

  const s = report.stats;

  return (
    <div className="page" style={{ maxWidth: 720 }}>
      <style>{`
        @media print {
          .no-print, body::before, body::after { display: none !important; }
          body { background: #fff !important; }
          .card { box-shadow: none !important; background: #fff !important; }
        }
      `}</style>

      <StethoArt />
      <h1 className="title">Patient health summary 🩺</h1>
      <p className="sub">
        Shared by the patient. Read only.
        {report.expiresAt && ` Link valid until ${new Date(report.expiresAt).toLocaleString()}.`}
      </p>

      <div className="no-print" style={{ textAlign: "center", marginBottom: 20 }}>
        <button
          className="btn"
          style={{ width: "auto", padding: "12px 28px" }}
          onClick={() => window.print()}
        >
          🖨️ Print / Save as PDF
        </button>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <h3 style={{ marginTop: 0, color: "#7c4dff" }}>Summary 📝</h3>
        <p>{report.summary}</p>
        {s && (
          <>
            <p style={{ fontSize: "0.85rem", opacity: 0.8 }}>
              Period: {s.from} to {s.to}
            </p>
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
          </>
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
        <h3 style={{ marginTop: 0, color: "#7c4dff" }}>Questions from the patient 🩺</h3>
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
    </div>
  );
}