export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  try {
    const { prompt, city = "Đà Lạt", vibe = "CHILL" } = req.body || {};
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return res.status(500).json({ error: "Missing GEMINI_API_KEY" });

    const finalPrompt = prompt || `Gợi ý 3 địa điểm thay thế tại ${city}, vibe ${vibe}. Trả về JSON array thuần.`;
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: finalPrompt }] }], generationConfig: { temperature: 0.9, maxOutputTokens: 700 } })
    });
    const data = await response.json();
    if (!response.ok) return res.status(response.status).json({ error: data?.error?.message || "Gemini error" });
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "[]";
    return res.status(200).json({ content: [{ text }], raw: data });
  } catch (error) {
    return res.status(500).json({ error: error.message || "Server error" });
  }
}
