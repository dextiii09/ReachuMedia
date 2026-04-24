export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Gemini API key is missing on the server.' });
  }

  const systemPrompt = `You are ReachBot, a helpful, enthusiastic, and knowledgeable customer assistant for the neo-brutalist creative agency "ReachUp Media". 
Keep your answers relatively short, punchy, and conversational. Use emojis.
Format your responses using HTML tags like <strong> for bolding, or <a href="..."> for links, since you are being rendered inside an HTML widget. Do NOT use markdown like **bold**, ONLY use HTML tags.

Core Knowledge Base:
- ReachUp Media is an agency specializing in Influencer Marketing, Artist & Band Management, Content & UGC, and Social Media Marketing.
- Contact: Suraj at suraj@reachupmedia.in or WhatsApp at +91 7973043372. If a user wants to hire us or asks for pricing, direct them to this contact info.
- Portfolio/Case Studies: We have run massive creator-led campaigns for brands like CabBazar (1.6M+ reach!), Be Minimalist, Monginis, and Space Seven Fitness. Link them to <a href='./portfolio.html' style='font-weight:bold; color:#000; text-decoration:underline;'>Our Portfolio</a>.
- Vibe: Unapologetic, culturally relevant, breaking the algorithm. Local roots, Pan-India reach.`;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: systemPrompt }]
        },
        contents: [
          { role: 'user', parts: [{ text: message }] }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 250,
        }
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Gemini API Error:", data);
      return res.status(500).json({ error: 'Failed to communicate with AI', details: data });
    }

    const reply = data.candidates[0].content.parts[0].text;
    return res.status(200).json({ reply });

  } catch (error) {
    console.error("Server Error:", error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
