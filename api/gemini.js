export default async function handler(req, res) {
  // 1. Allow CORS (So your site can talk to this server)
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') { res.status(200).end(); return; }
  if (req.method !== 'POST') { return res.status(405).json({ error: 'Method Not Allowed' }); }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'API Key missing in Vercel.' });

  const { prompt } = req.body;

  try {
    // 🚀 FIX: Using 'v1' endpoint which is more stable for free keys
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      }
    );

    const data = await response.json();

    if (data.error) {
      // If gemini-pro fails, fallback to gemini-1.5-flash
      console.log("Retrying with Flash model...");
      const retryResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        }
      );
      const retryData = await retryResponse.json();
      if (retryData.error) return res.status(500).json({ error: retryData.error.message });
      return res.status(200).json(retryData);
    }

    res.status(200).json(data);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
