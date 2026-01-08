export default async function handler(req, res) {
  // 1. Check Method
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // 2. Get Key from Vercel
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API Key missing in Vercel Settings.' });
  }

  const { prompt } = req.body;

  try {
    // 3. Connect to Google (USING GEMINI-PRO - The Stable Version)
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      }
    );

    const data = await response.json();

    // 4. Handle Google Errors
    if (data.error) {
      return res.status(500).json({ error: "Google Error: " + data.error.message });
    }

    // 5. Send Success
    res.status(200).json(data);

  } catch (error) {
    res.status(500).json({ error: "Server Error: " + error.message });
  }
}
