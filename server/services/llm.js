const SYSTEM_PROMPT = `You are a symptom-logging assistant. Convert the user's description into JSON only, with no extra text, matching this schema:
{"symptoms":[{"name":string,"severity":number|null,"bodyArea":string|null}],
 "flow":"none"|"light"|"medium"|"heavy"|null,
 "mood":string|null,
 "sleepHours":number|null,
 "notes":string}
Rules: never invent details the user did not state. Use null when unknown. Severity is 0-10. The user may write in any language; always output English symptom names. Do not diagnose or give medical advice.`;

export async function callLLM(userText, systemPrompt = SYSTEM_PROMPT) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${process.env.LLM_MODEL}:generateContent?key=${process.env.LLM_API_KEY}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [ { text: systemPrompt }] },
      contents: [{ role: "user", parts: [{ text: userText }] }],
      generationConfig: { temperature: 0.2, responseMimeType: "application/json" },
    }),
  });
  if (!res.ok) throw new Error(`LLM error ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
}

// Clean and validate whatever the model returns
export function sanitize(raw) {
  const cleaned = raw.replace(/```json|```/g, "").trim();
  const obj = JSON.parse(cleaned);
  const flows = ["none", "light", "medium", "heavy"];
  const num = (v, min, max) =>
    typeof v === "number" && !isNaN(v) ? Math.min(max, Math.max(min, v)) : null;

  return {
    symptoms: (Array.isArray(obj.symptoms) ? obj.symptoms : [])
      .filter((s) => s && typeof s.name === "string" && s.name.trim())
      .map((s) => ({
        name: s.name.trim().toLowerCase(),
        severity: num(s.severity, 0, 10),
        bodyArea: typeof s.bodyArea === "string" ? s.bodyArea.toLowerCase() : null,
      })),
    flow: flows.includes(obj.flow) ? obj.flow : null,
    mood: typeof obj.mood === "string" ? obj.mood : null,
    sleepHours: num(obj.sleepHours, 0, 24),
    notes: typeof obj.notes === "string" ? obj.notes : "",
  };
}

// Calls the model, retries once if the output isn't valid JSON
export async function parseSymptoms(text) {
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      return sanitize(await callLLM(text));
    } catch (e) {
      if (attempt === 1) throw e;
    }
  }
}const REPORT_PROMPT = `You help a patient prepare for a doctor's appointment. You receive JSON with symptom statistics and rule-based pattern flags from the patient's own logs.
Return JSON only: {"summary": string, "doctorQuestions": [string]}
Rules: summary is at most 120 words, neutral and factual, written for a clinician, and uses ONLY the data provided. Never diagnose, never name a condition, never recommend treatment. doctorQuestions has at most 6 short questions the patient could ask her doctor, based on the flags.`;

export async function summarizeForDoctor(payload) {
  const raw = await callLLM(JSON.stringify(payload), REPORT_PROMPT);
  const obj = JSON.parse(raw.replace(/```json|```/g, "").trim());
  return {
    summary: String(obj.summary || ""),
    doctorQuestions: Array.isArray(obj.doctorQuestions)
      ? obj.doctorQuestions.map(String).slice(0, 6)
      : [],
  };
}