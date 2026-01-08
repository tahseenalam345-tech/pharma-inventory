export default async function handler(req, res) {
  // 1. Setup Headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  // 2. Check Vercel Key
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: '❌ FATAL: Vercel Env Variable GEMINI_API_KEY is missing.' });

  const { prompt } = req.body;

  // 3. The "Smart List" of Models to try
  const models = [
    "gemini-1.5-flash",  // Newest, Fastest
    "gemini-1.5-pro",    // Smarter
    "gemini-1.0-pro",    // Old Reliable
    "gemini-pro"         // Legacy
  ];

  // 4. Try them one by one
  for (const model of models) {
    try {
      console.log(`Trying model: ${model}...`);
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        }
      );

      const data = await response.json();

      if (!data.error) {
        // ✅ SUCCESS! We found a working model.
        return res.status(200).json(data);
      }
      
      console.warn(`Model ${model} failed:`, data.error.message);
      
    } catch (err) {
      console.error(`Network error on ${model}:`, err);
    }
  }

  // 5. If all failed
  return res.status(500).json({ error: "❌ All AI Models failed. Check your API Key permissions in Google AI Studio." });
}
