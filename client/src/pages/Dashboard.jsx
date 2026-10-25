import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { api } from "../api";

// true = backend illama sample data. Backend ready aanadhum false aakkunga.
const USE_MOCK = false;

function makeMock() {
  const series = [];
  for (let i = 0; i < 30; i++) {
    const d = new Date(Date.now() - (29 - i) * 86400000);
    const inPeriod = i % 28 < 5;
    series.push({
      date: d.toISOString().slice(0, 10),
      pain: inPeriod ? 6 + (i % 3) : i % 4,
      sleepHours: 5 + (i % 4),
      flowLevel: inPeriod ? 1 + (i % 3) : 0,
    });
  }
  return {
    days: 30,
    series,
    summary: {
      avgCycleLength: 28,
      topSymptoms: [
        { name: "cramps", days: 12, avgSeverity: 6.5 },
        { name: "fatigue", days: 9, avgSeverity: 4.2 },
        { name: "headache", days: 5, avgSeverity: 3.8 },
      ],
    },
  };
}

const card = {
  border: "1px solid #ccc",
  borderRadius: 8,
  padding: 12,
  marginBottom: 16,
};

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        if (USE_MOCK) {
          setData(makeMock());
        } else {
          setData(await api("/logs/stats?days=90"));
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <p style={{ padding: 16 }}>Loading your patterns...</p>;
  if (error) return <p style={{ padding: 16, color: "crimson" }}>{error}</p>;
  if (!data || !data.series || data.series.length === 0) {
    return <p style={{ padding: 16 }}>No logs yet. Add your first one!</p>;
  }

  const { series, summary } = data;

  return (
    <div style={{ maxWidth: 700, margin: "24px auto", padding: 16 }}>
      <h1>Your patterns</h1>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 16 }}>
        <div style={{ ...card, flex: 1, minWidth: 140, marginBottom: 0 }}>
          <div>Average cycle</div>
          <h2>{summary?.avgCycleLength ? `${summary.avgCycleLength} days` : "Not enough data"}</h2>
        </div>
        {(summary?.topSymptoms || []).slice(0, 3).map((s) => (
          <div key={s.name} style={{ ...card, flex: 1, minWidth: 140, marginBottom: 0 }}>
            <div>{s.name}</div>
            <h2>{s.days} days</h2>
            <div>avg severity {s.avgSeverity}</div>
          </div>
        ))}
      </div>

      <div style={card}>
        <h3>Pain (0 to 10)</h3>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={series}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tickFormatter={(d) => d.slice(5)} />
            <YAxis domain={[0, 10]} />
            <Tooltip />
            <Line type="monotone" dataKey="pain" stroke="#c0392b" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div style={card}>
        <h3>Sleep (hours)</h3>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={series}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tickFormatter={(d) => d.slice(5)} />
            <YAxis domain={[0, 12]} />
            <Tooltip />
            <Line type="monotone" dataKey="sleepHours" stroke="#2980b9" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div style={card}>
        <h3>Flow (0 none, 1 light, 2 medium, 3 heavy)</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={series}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tickFormatter={(d) => d.slice(5)} />
            <YAxis domain={[0, 3]} allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="flowLevel" fill="#8e44ad" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}