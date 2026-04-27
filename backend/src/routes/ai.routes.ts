import { Router, Request, Response } from 'express'; // Restarted at 12:55 PM
import axios from 'axios';

const router = Router();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const SYSTEM_PROMPT = `
You are TestimonialHub AI, a powerful assistant for the TestimonialHub application.
Your goal is to help users manage their customer feedback and create beautiful testimonial cards.
You know about the system features:
1. Dashboard: Overview of stats and recent activity.
2. Create Testimonial: Upload screenshots or paste text to generate cards.
3. Batch Processing: Bulk process multiple screenshots at once.
4. Wall of Love: View and manage all collected testimonials.
5. AI Extraction: High-precision extraction of feedback using Gemini 1.5.

Be professional, helpful, and concise.
`;

router.post('/chat', async (req: Request, res: Response): Promise<any> => {
  const { message } = req.body;
  const key = process.env.GROQ_API_KEY;

  if (!key) {
    return res.status(500).json({ error: 'Groq API Key not configured on server' });
  }

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: message }
        ],
        temperature: 0.7,
        max_tokens: 1024
      })
    });

    const data: any = await response.json();
    if (response.ok) {
      const reply = data.choices[0].message.content;
      res.json({ reply });
    } else {
      res.status(response.status).json({ error: data.error?.message || 'Groq API Error' });
    }
  } catch (error) {
    console.error('Groq Chat Error:', error);
    res.status(500).json({ error: 'Failed to connect to Groq service' });
  }
});

router.post('/extract', async (req: Request, res: Response): Promise<any> => {
  const { image, mimeType } = req.body;
  const key = process.env.GEMINI_API_KEY;

  if (!key) {
    return res.status(500).json({ error: 'Gemini API Key not configured on server' });
  }

  try {
    const base64Data = image.includes(',') ? image.split(',')[1] : image;
    
    const prompt = `
      Analyze this image of a chat (WhatsApp, LinkedIn, Twitter, etc.) or the provided raw text review. 
      Extract the following information and structure it into a clean JSON object.
      
      Fields to extract:
      - feedback: The actual message or review text.
      - name: Full name of the person giving the feedback (use 'Anonymous' if not found).
      - role: Their job title or designation (use '' if not found).
      - company: The company they work for (use '' if not found).
      - date: Date of the message (Format: "10 April 2024", use today if not found).
      - time: Time of the message (Format: "10:45 PM", use current time if not found).
      - rating: Number 1-5 based on sentiment.
      - profileImage: Use null always for now unless specified (Set to null).
      - tone: Single word (e.g. Professional, Friendly, Excited).
      - isSupported: true if this is a valid testimonial, false otherwise.

      Return ONLY a JSON object in this format:
      { "feedback": string, "name": string, "role": string, "company": string, "date": string, "time": string, "rating": number, "tone": string, "isSupported": boolean, "profileImage": null }
    `;

    // Primary: Gemini 2.x/2.5 Flash (Reliable and Fast in 2026)
    const geminiModels = [
      'gemini-2.5-flash', 
      'gemini-2.5-pro',
      'gemini-2.0-flash', 
      'gemini-3.1-pro-preview',
      'gemini-flash-latest'
    ];
    const apiVersions = ['v1', 'v1beta'];
    
    let isRateLimited = false;
    let rateLimitMessage = '';

    for (const version of apiVersions) {
      for (const modelId of geminiModels) {
        try {
          console.log(`[Gemini] Attempting ${modelId} via ${version}...`);
          const url = `https://generativelanguage.googleapis.com/${version}/models/${modelId}:generateContent?key=${key}`;
          
          const parts = mimeType === 'text/plain' 
            ? [
                { text: prompt },
                { text: "Here is the raw text to analyze:\n" + base64Data }
              ]
            : [
                { text: prompt },
                { inline_data: { mime_type: mimeType || "image/png", data: base64Data } }
              ];

          const response = await axios.post(url, {
            contents: [{
              role: "user",
              parts: parts
            }]
          }, {
            headers: { 'Content-Type': 'application/json' },
            timeout: 20000
          });

          if (response.data && response.data.candidates?.[0]?.content?.parts?.[0]?.text) {
            const text = response.data.candidates[0].content.parts[0].text;
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              console.log(`[Gemini] Success: ${modelId} (${version})`);
              return res.json(JSON.parse(jsonMatch[0]));
            }
          }
        } catch (err: any) {
          const status = err.response?.status;
          const errMsg = err.response?.data?.error?.message || err.message;
          console.error(`[Gemini] ${modelId} (${version}) Failed [${status}]:`, errMsg);
          
          if (status === 429) {
            isRateLimited = true;
            rateLimitMessage = errMsg;
          }
        }
      }
    }

    console.warn('[AI] Gemini exhausted, trying Groq...');

    const groqKey = process.env.GROQ_API_KEY;
    if (groqKey) {
      const groqModels = [
        'groq/compound', 
        'groq/compound-mini',
        'llama-3.3-70b-versatile',
        'meta-llama/llama-4-scout-17b-16e-instruct'
      ];
      for (const modelId of groqModels) {
        try {
          console.log(`[Groq] Attempting ${modelId}...`);
          const isVision = modelId.includes('vision') || modelId.includes('compound') || modelId.includes('scout');
          
          const content: any = isVision && mimeType !== 'text/plain' ? [
            { type: "text", text: prompt + "\nIMPORTANT: Return ONLY valid JSON. No other text." },
            { type: "image_url", image_url: { url: `data:${mimeType || 'image/png'};base64,${base64Data}` } }
          ] : prompt + "\nText to analyze: " + base64Data + "\nIMPORTANT: Return ONLY valid JSON. No other text.";

          const groqResponse = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
            model: modelId,
            messages: [{ role: "user", content }],
            response_format: { type: "json_object" },
            temperature: 0.1
          }, {
            headers: { 
              'Authorization': `Bearer ${groqKey}`,
              'Content-Type': 'application/json'
            },
            timeout: 30000 
          });

          if (groqResponse.data?.choices?.[0]?.message?.content) {
            console.log(`[Groq] Success: ${modelId}`);
            const content = groqResponse.data.choices[0].message.content;
            return res.json(JSON.parse(content));
          }
        } catch (err: any) {
          const status = err.response?.status;
          console.error(`[Groq] ${modelId} Failed [${status}]:`, err.response?.data?.error?.message || err.message);
          
          if (status === 429) {
            isRateLimited = true;
            rateLimitMessage = err.response?.data?.error?.message || 'Groq Rate Limit Exceeded';
          }
        }
      }
    }

    if (isRateLimited) {
      return res.status(429).json({ error: `AI Rate Limit Exceeded: ${rateLimitMessage}` });
    }

    return res.status(503).json({ error: 'AI Services are currently overloaded or unavailable. Please try again in a few minutes.' });
  } catch (error) {
    console.error('Gemini Extraction Error:', error);
    res.status(500).json({ error: 'Failed to process image with AI' });
  }
});

router.post('/enhance', async (req: Request, res: Response): Promise<any> => {
  const { feedback, tone } = req.body;
  const key = process.env.GROQ_API_KEY;

  if (!key) {
    return res.status(500).json({ error: 'Groq API Key not configured on server' });
  }

  try {
    const prompt = `
      You are an expert copywriter. Rewrite the following customer testimonial to match the requested tone.
      Maintain the original sentiment and key facts, but adjust the wording.
      
      TONE: ${tone}
      TESTIMONIAL: "${feedback}"
      
      Requirements for each tone:
      - Original: Keep it exactly as is (no change).
      - Professional: Use sophisticated, business-appropriate language.
      - Concise: Make it short and punchy, ideal for quick reading.
      - Expanded: Add descriptive detail and elaborate on the positive sentiment without inventing new facts.
      
      Return ONLY the rewritten testimonial text. No quotes, no preamble.
    `;

    const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 1024
    }, {
      headers: { 
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.data?.choices?.[0]?.message?.content) {
      res.json({ feedback: response.data.choices[0].message.content.trim() });
    } else {
      res.status(500).json({ error: 'AI failed to generate enhanced text' });
    }
  } catch (error: any) {
    console.error('Enhancement Error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to enhance testimonial' });
  }
});

export default router;
