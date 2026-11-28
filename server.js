import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

const app = express();
const PORT = Number(process.env.PORT || 3000);
const API_KEY = process.env.AI_API_KEY;
const BASE_URL = (process.env.AI_BASE_URL || "https://api.openai.com/v1").replace(/\/$/, "");
const MODEL = process.env.AI_MODEL || "gpt-4o-mini";
const ORIGIN = process.env.ALLOWED_ORIGIN || "*";

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: ORIGIN === "*" ? true : ORIGIN.split(",").map(x => x.trim()) }));
app.use(express.json({ limit: "12mb" }));
app.use("/api/", rateLimit({ windowMs: 60_000, limit: 30, standardHeaders: true, legacyHeaders: false }));
app.use(express.static("public"));

app.get("/api/health", (_req, res) => res.json({ ok: true, service: "RNS AI API", modelConfigured: Boolean(API_KEY) }));

async function askModel(messages) {
  if (!API_KEY) throw Object.assign(new Error("AI_API_KEY belum diatur pada server."), { status: 503 });
  const response = await fetch(`${BASE_URL}/chat/completions`, {
    method: "POST",
    headers: { "Authorization": `Bearer ${API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: MODEL, messages, temperature: 0.7 })
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw Object.assign(new Error(data?.error?.message || "Penyedia AI gagal memproses permintaan."), { status: response.status });
  return data?.choices?.[0]?.message?.content ?? "";
}

app.post("/api/chat", async (req, res) => {
  try {
    const { messages } = req.body || {};
    if (!Array.isArray(messages) || !messages.length || messages.length > 30) return res.status(400).json({ error: "messages tidak valid (maksimal 30 pesan)." });
    const allowed = messages.filter(m => m && ["user", "assistant"].includes(m.role) && (typeof m.content === "string" || Array.isArray(m.content)));
    const system = { role: "system", content: "Kamu adalah RNS AI, asisten berbahasa Indonesia yang membantu percakapan, coding, desain, dan proyek. Jelaskan batasan dan jangan mengarang hasil pengujian." };
    const reply = await askModel([system, ...allowed]);
    res.json({ reply });
  } catch (e) { res.status(e.status || 500).json({ error: e.message || "Kesalahan server." }); }
});

app.post("/api/task", async (req, res) => {
  try {
    const prompt = String(req.body?.prompt || "").trim();
    if (!prompt || prompt.length > 50_000) return res.status(400).json({ error: "Instruksi kosong atau terlalu panjang." });
    const reply = await askModel([
      { role: "system", content: "Kamu adalah RNS AI. Berikan jawaban Indonesia yang akurat, terstruktur, dan praktis. Untuk kode, sertakan kode lengkap dan sebutkan asumsi penting. Jangan mengklaim telah menjalankan atau menguji kode." },
      { role: "user", content: prompt }
    ]);
    res.json({ reply });
  } catch (e) { res.status(e.status || 500).json({ error: e.message || "Kesalahan server." }); }
});

app.listen(PORT, () => console.log(`RNS AI server aktif pada port ${PORT}`));
