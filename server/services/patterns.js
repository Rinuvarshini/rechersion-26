const DAY = 86400000;
const dayNum = (d) => Math.floor(new Date(d).getTime() / DAY);
const FLOW = ["light", "medium", "heavy"];

export function analyze(logs) {
  const sorted = [...logs].sort((a, b) => new Date(a.date) - new Date(b.date));
  const flags = [];

  // Cycle starts: first flow day after at least 5 days without flow
  const flowDays = sorted.filter((l) => FLOW.includes(l.flow)).map((l) => dayNum(l.date));
  const starts = [];
  let last = -Infinity;
  for (const d of flowDays) {
    if (d - last > 5) starts.push(d);
    last = d;
  }
  const gaps = starts.slice(1).map((d, i) => d - starts[i]);
  const avgCycle = gaps.length ? Math.round(gaps.reduce((a, b) => a + b, 0) / gaps.length) : null;

  if (gaps.length >= 2) {
    const range = Math.max(...gaps) - Math.min(...gaps);
    if (avgCycle > 35 || avgCycle < 21 || range > 7) {
      flags.push({
        title: "Irregular cycle length",
        evidence: `${gaps.length} cycles logged, lengths ${gaps.join(", ")} days (average ${avgCycle}, spread ${range} days).`,
        discuss: "Ask whether cycle length variation needs checking.",
      });
    }
  }

  // Severe pain on several days
  const painDays = new Set();
  for (const l of sorted)
    for (const s of l.symptoms || [])
      if (/pain|cramp|ache/i.test(s.name || "") && (s.severity ?? 0) >= 7) painDays.add(dayNum(l.date));
  if (painDays.size >= 3) {
    flags.push({
      title: "Recurring severe pain",
      evidence: `Pain rated 7/10 or higher on ${painDays.size} different days.`,
      discuss: "Ask what could explain recurring severe pain and which tests are appropriate.",
    });
  }

  // Heavy flow
  const heavy = sorted.filter((l) => l.flow === "heavy").length;
  if (heavy >= 3) {
    flags.push({
      title: "Frequent heavy flow",
      evidence: `Heavy flow recorded on ${heavy} days.`,
      discuss: "Ask whether heavy bleeding should be investigated.",
    });
  }

  // Sleep
  const sleeps = sorted.map((l) => l.sleepHours).filter((v) => typeof v === "number");
  const avgSleep = sleeps.length ? +(sleeps.reduce((a, b) => a + b, 0) / sleeps.length).toFixed(1) : null;
  if (sleeps.length >= 5 && avgSleep < 6) {
    flags.push({
      title: "Low average sleep",
      evidence: `Average ${avgSleep} hours across ${sleeps.length} logged nights.`,
      discuss: "Ask whether poor sleep could be linked to her other symptoms.",
    });
  }

  // Fatigue
  const fatigueDays = sorted.filter((l) => (l.symptoms || []).some((s) => /fatigue|tired|exhaust/i.test(s.name || ""))).length;
  if (fatigueDays >= 5) {
    flags.push({
      title: "Frequent fatigue",
      evidence: `Fatigue logged on ${fatigueDays} days.`,
      discuss: "Ask whether blood tests for causes of fatigue are advisable.",
    });
  }

  // Low mood
  const lowMood = sorted.filter((l) => /low|sad|anxious|depress|irritab/i.test(l.mood || "")).length;
  if (lowMood >= 5 && lowMood / sorted.length >= 0.3) {
    flags.push({
      title: "Persistent low mood",
      evidence: `Low or anxious mood on ${lowMood} of ${sorted.length} logged days.`,
      discuss: "Ask about support options for mood changes.",
    });
  }

  // Top symptoms
  const counts = {};
  for (const l of sorted)
    for (const s of l.symptoms || []) {
      const c = (counts[s.name] ||= { name: s.name, days: 0, sum: 0, n: 0 });
      c.days++;
      if (typeof s.severity === "number") { c.sum += s.severity; c.n++; }
    }
  const topSymptoms = Object.values(counts)
    .sort((a, b) => b.days - a.days)
    .slice(0, 5)
    .map((c) => ({ name: c.name, days: c.days, avgSeverity: c.n ? +(c.sum / c.n).toFixed(1) : null }));

  const stats = {
    totalLogs: sorted.length,
    from: sorted[0]?.date,
    to: sorted[sorted.length - 1]?.date,
    cyclesDetected: starts.length,
    avgCycleLength: avgCycle,
    avgSleep,
    topSymptoms,
  };
  return { flags, stats };
}
