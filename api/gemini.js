// api/gemini.js
// We use 'module.exports' to fix the Vercel Warning
module.exports = async (req, res) => {
  
  // 1. Setup CORS (Allows your site to talk to this server)
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle browser pre-checks
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  // 2. Check API Key
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'API Key missing in Vercel Settings' });

  const { prompt } = req.body;

  // 3. ATTEMPT 1: Try Gemini 1.5 Flash (Newest)
  try {
    const response1 = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      }
    );
    const data1 = await response1.json();
    
    // If it worked, send it back!
    if (!data1.error) return res.status(200).json(data1);
    
    console.log("Flash failed (" + data1.error.message + "). Switching to Pro...");

  } catch (e) {
    console.log("Network error on Flash. Switching to Pro...");
  }

  // 4. ATTEMPT 2: Try Gemini Pro (Standard Fallback)
  try {
    const response2 = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      }
    );
    const data2 = await response2.json();

    if (data2.error) return res.status(500).json({ error: "Google Error: " + data2.error.message });

    return res.status(200).json(data2);

  } catch (error) {
    return res.status(500).json({ error: "Server Error: " + error.message });
  }
};
