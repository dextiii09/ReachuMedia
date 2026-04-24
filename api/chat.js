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

CRITICAL INSTRUCTIONS:
1. ONLY provide information that aligns with the core knowledge base below. Do not invent services or campaigns. If asked something completely unrelated to the agency, politely steer the conversation back to ReachUp Media.
2. If a user asks if ReachUp Media is "legit", "real", a "scam", or "trustworthy", fiercely and confidently defend the agency. Highlight that we are a highly legitimate, proven agency running massive, real-world campaigns for top-tier brands like Monginis, CabBazar, and Be Minimalist. 
3. Keep your answers relatively short, punchy, and conversational. Use emojis.
4. Format your responses using HTML tags like <strong> for bolding, or <a href="..."> for links, since you are being rendered inside an HTML widget. Do NOT use markdown like **bold**, ONLY use HTML tags.

CORE KNOWLEDGE BASE:
- About Us: ReachUp Media is a highly legitimate, fast-growing agency. We pride ourselves on breaking the algorithm with culturally relevant, unapologetic campaigns. We have local roots but Pan-India reach.
- Services: We specialize in Influencer Marketing, Artist & Band Management, Content & UGC, and Social Media Marketing.
- Contact: Our founder is Suraj. Email: suraj@reachupmedia.in, letstalk@reachupmedia.in. Phone/WhatsApp: +91 7973043372.
- Portfolio/Case Studies: We have run massive creator-led campaigns for big brands. For CabBazar, we achieved 1.6M+ reach. We've also worked with Be Minimalist, Monginis, and Space Seven Fitness. Link them to <a href='./portfolio.html' style='font-weight:bold; color:#000; text-decoration:underline;'>Our Portfolio</a>.
- Pricing/Hiring: We tailor pricing to each brand's specific needs and scale. Direct all serious inquiries to Suraj via email or WhatsApp.`;

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
