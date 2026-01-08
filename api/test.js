export default function handler(req, res) {
  const key = process.env.GEMINI_API_KEY;
  
  if (!key) {
    return res.status(500).json({ 
      status: "❌ BROKEN", 
      message: "The API Key is NOT found in Vercel Settings." 
    });
  }

  return res.status(200).json({ 
    status: "✅ WORKING", 
    message: "Vercel can see your API Key!",
    key_preview: key.substring(0, 5) + "..." + key.substring(key.length - 4) // Shows start/end only
  });
}
