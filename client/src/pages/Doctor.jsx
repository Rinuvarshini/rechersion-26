import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../api";

export default function Doctor() {
  const { token } = useParams();
  const [r, setR] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api(`/reports/share/${token}`)
      .then(setR)
      .catch((e) =>
        setError(e.status === 404 ? "This link has expired or is not valid." : e.message)
      )
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return <p style={{ padding: 16 }}>Loading...</p>;
  if (error)
    return (
      <div className="page" style={{ maxWidth: 720 }}>
        <p className="error">{error}</p>
      </div>
    );

  const s = r.stats;
  const fmt = (d) => (d ? new Date(d).toLocaleDateString() : "-");

  return (
    <div className="page" style={{ maxWidth: 720 }}>
      <style>{`@media print { nav, .no-print { display: none !important; } .card { box-shadow: none !important; } }`}</style>

      <h1 className="title">HERTale health summary</h1>
      <p className="sub">
        Patient-logged data, last {r.periodDays} days ({fmt(s?.from)} to {fmt(s?.to)}). Link expires {fmt(r.expiresAt)}.
      </p>

      <div className="card" style={{ marginBottom: 20 }}>
        <h3 style={{ marginTop: 0 }}>Summary</h3>
        <p>{r.summary}</p>
        {s && (
          <p style={{ marginBottom: 0 }}>
            <b>Logs:</b> {s.totalLogs} &nbsp; <b>Cycles detected:</b> {s.cyclesDetected} &nbsp;
            <b>Avg cycle:</b> {s.avgCycleLength ? `${s.avgCycleLength} days` : "-"} &nbsp;
            <b>Avg sleep:</b> {s.avgSleep ? `${s.avgSleep} h` : "-"}
          </p>
        )}
      </div>

      {s?.topSymptoms?.length > 0 && (
        <div className="card" style={{ marginBottom: 20 }}>
          <h3 style={{ marginTop: 0 }}>Most frequent symptoms</h3>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ textAlign: "left" }}>
                <th>Symptom</th><th>Days logged</th><th>Avg severity (0-10)</th>
              </tr>
            </thead>
            <tbody>
              {s.topSymptoms.map((t) => (
                <tr key={t.name}>
                  <td style={{ textTransform: "capitalize" }}>{t.name}</td>
                  <td>{t.days}</td>
                  <td>{t.avgSeverity ?? "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <h3>Patterns noted from the logs</h3>
      {(r.flags || []).map((f, i) => (
        <div key={i} className="card" style={{ marginBottom: 14, padding: 16 }}>
          <b>{f.title}</b>
          <p style={{ margin: "6px 0 0" }}>{f.evidence}</p>
        </div>
      ))}

      <div className="card" style={{ marginBottom: 20 }}>
        <h3 style={{ marginTop: 0 }}>Questions the patient would like to discuss</h3>
        <ol>
          {(r.doctorQuestions || []).map((q, i) => (
            <li key={i} style={{ marginBottom: 8 }}>{q}</li>
          ))}
        </ol>
      </div>

      <p style={{ background: "#fff3cd", padding: 14, borderRadius: 14, fontSize: "0.9rem" }}>
        {r.disclaimer}
      </p>

      <button className="btn no-print" style={{ width: "auto", padding: "12px 24px" }} onClick={() => window.print()}>
        Print / Save as PDF
      </button>
    </div>
  );
}