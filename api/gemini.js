export default async function handler(req, res) {
  // 1. Setup CORS (Allows your website to talk to this server)
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle browser checks
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  // 2. Get Key from Vercel
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'Server Error: GEMINI_API_KEY is missing in Vercel.' });

  const { prompt } = req.body;

  // 3. Define the Models to try (in order of preference)
  // We match the correct API Version (v1beta vs v1) to the Model Name
  const candidates = [
    { url: "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent", name: "Gemini 1.5 Flash" },
    { url: "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent", name: "Gemini 1.5 Pro" },
    { url: "https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent", name: "Gemini 1.0 Pro" }
  ];

  // 4. Loop through models until one works
  for (const model of candidates) {
    try {
      console.log(`Trying ${model.name}...`);
      
      const response = await fetch(`${model.url}?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      });

      const data = await response.json();

      // If successful, send data back to frontend and STOP looping
      if (!data.error) {
        return res.status(200).json(data);
      }

      console.warn(`${model.name} failed:`, data.error.message);

    } catch (err) {
      console.error(`Network error on ${model.name}`);
    }
  }

  // 5. If we get here, ALL models failed
  return res.status(500).json({ error: "All AI models failed. Please check your API Key permissions in Google AI Studio." });
}
