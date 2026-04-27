const positiveWords = [
  'amazing', 'awesome', 'excellent', 'great', 'fantastic', 'wonderful', 'love',
  'best', 'perfect', 'outstanding', 'brilliant', 'superb', 'incredible', 'good',
  'happy', 'thank', 'thanks', 'recommend', 'helpful', 'professional', 'impressed',
  'quality', 'satisfied', 'reliable', 'exceptional', 'beautiful', 'delighted',
  'fabulous', 'terrific', 'marvelous', 'top-notch', 'first-class', 'stellar',
  '🔥', '❤️', '👍', '😍', '🙏', '💯', '⭐', '👏', '💪', '🎉',
];

const negativeWords = [
  'bad', 'terrible', 'awful', 'horrible', 'worst', 'poor', 'disappointed',
  'hate', 'useless', 'waste', 'pathetic', 'disgusting', 'annoying', 'frustrating',
  'slow', 'broken', 'scam', 'fake', 'never', 'refund', 'complaint',
  '😡', '👎', '😤', '💔', '😞',
];

export function analyzeSentiment(text: string): {
  tone: 'positive' | 'neutral' | 'negative';
  rating: number;
  confidence: number;
} {
  const lower = text.toLowerCase();
  let score = 0;
  let matches = 0;

  for (const word of positiveWords) {
    if (lower.includes(word)) { score += 1; matches++; }
  }
  for (const word of negativeWords) {
    if (lower.includes(word)) { score -= 1; matches++; }
  }

  const confidence = Math.min(matches / 5, 1);
  const tone = score > 0 ? 'positive' : score < 0 ? 'negative' : 'neutral';
  const rating = tone === 'positive' ? Math.min(Math.round(3 + score * 0.5), 5) : tone === 'negative' ? Math.max(Math.round(3 + score * 0.5), 1) : 3;

  return { tone, rating, confidence };
}

export function suggestEmojis(tone: 'positive' | 'neutral' | 'negative'): string[] {
  if (tone === 'positive') return ['⭐', '🔥', '💯', '🙌', '❤️'];
  if (tone === 'negative') return ['😔', '🤔', '💭'];
  return ['👍', '✅', '💬'];
}

export function cleanExtractedText(raw: string): { 
  feedback: string; 
  time: string; 
  name: string; 
  role: string; 
  company: string; 
  date: string 
} {
  let time = '';
  let name = '';
  let role = '';
  let company = '';
  let date = '';
  
  const isUIMessage = (line: string) => {
     const lower = line.toLowerCase().trim();
     const uiKeywords = [
        'type a message', 'message...', 'whatsapp', 'messages to this chat', 'messages to this group',
        'end-to-end encrypted', 'online', 'typing...', 'today', 'yesterday', 'missed call', 'voice call',
        'video call', 'battery', 'wi-fi', 'lte', '4g', '5g', 'verizon', 'at&t', 't-mobile',
        'airtel', 'jio', 'vodafone', 'search', 'edit', 'details', 'cancel', 'send', 'forwarded', 'edited'
     ];
     // Handle OCR errors where colon is read as dot or comma (e.g. 1.03)
     if (/^\d{1,2}[:.,]\d{2}$/.test(lower)) return true; 
     if (/^\d{1,3}%$/.test(lower)) return true; // battery percent
     if (uiKeywords.some(kw => lower === kw || (lower.includes(kw) && lower.length < kw.length + 8))) return true;
     return false;
  };

  // First pass: extract explicit labels before splitting
  const lines = raw.split('\n').map(l => l.trim()).filter(Boolean);
  for (const line of lines) {
    const lowerLine = line.toLowerCase();
    if (lowerLine.startsWith('name:')) name = line.substring(5).trim();
    if (lowerLine.startsWith('designation:') || lowerLine.startsWith('role:')) role = line.substring(line.indexOf(':') + 1).trim();
    if (lowerLine.startsWith('company:')) company = line.substring(8).trim();
    if (lowerLine.startsWith('date:')) date = line.substring(5).trim();
  }

  // Second pass: Intelligent Chat Bubble Isolation
  // WhatsApp bubbles usually end with a time marker. We split the raw text by these markers.
  // Robust regex for time: handles colons, dots, or commas (OCR errors), and optional 'edited' tag
  const timeRegex = /(?:\b\d{1,2}[:.,]\d{2}(?:\s*(?:AM|PM|am|pm))?\b)|(?:\bedited\s+\d{1,2}[:.,]\d{2}(?:\s*(?:AM|PM|am|pm))?\b)/gi;
  
  // Extract the latest time found
  const timeMatches = raw.match(timeRegex);
  if (timeMatches && timeMatches.length > 0) {
     time = timeMatches[timeMatches.length - 1]; // Use the last time marker found
  }

  // Split raw text into isolated chat bubbles based on time boundaries and empty lines
  const rawSegments = raw.split(timeRegex);
  
  const cleanedSegments = rawSegments.map(segment => {
     const segLines = segment.split('\n')
        .map(l => l.replace(/(?:✓|✔️|☑️|")/g, '').replace(/^\s*[-–—•]\s*/, '').trim())
        .filter(l => l.length > 2)
        .filter(l => {
           const low = l.toLowerCase();
           if (low.startsWith('name:') || low.startsWith('designation:') || low.startsWith('role:') || low.startsWith('company:') || low.startsWith('date:') || low.startsWith('time:')) return false;
           if (isUIMessage(l)) return false;
           if (low === 'am' || low === 'pm') return false;
           return true;
        });
     return segLines.join('\n');
  }).filter(seg => seg.length > 0);

  // Pick the FIRST valid segment chronologically that looks like a real review (skip links)
  let bestFeedback = '';
  const validSegments = cleanedSegments.filter(s => {
     const trimmed = s.trim();
     if (trimmed.length < 10) return false;
     // Skip segments that are just URLs (Google Meet, etc)
     const urlRegex = /^(https?:\/\/[^\s]+)$|^(meet\.google\.com\/[^\s]+)$/;
     if (urlRegex.test(trimmed.toLowerCase())) return false;
     // Skip segments that are 80%+ symbols/URLs
     const urlMatches = trimmed.match(/https?:\/\/[^\s]+/g) || [];
     if (urlMatches.length > 0 && urlMatches.join('').length > trimmed.length * 0.5) return false;
     
     return true;
  });
  
  if (validSegments.length > 0) {
     bestFeedback = validSegments[0]; // First come first serve
  } else {
     // Fallback if no time markers existed or segments were too tiny
     const fallbackLines = lines
       .filter(l => !l.toLowerCase().includes('name:') && !isUIMessage(l))
       .map(l => l.replace(/(?:✓|✔️|☑️|")/g, '').trim());
     bestFeedback = fallbackLines.join('\n');
  }

  // Final cleanup of the chosen block: strip short fillers and METADATA labels
  const feedbackLines = bestFeedback.split('\n');
  const isolatedFeedback = feedbackLines.filter(l => {
     const low = l.toLowerCase();
     // Strip lines that start with metadata labels so they don't appear in the testimonial text
     if (low.startsWith('name:') || low.startsWith('company:') || low.startsWith('designation:') || low.startsWith('role:')) return false;
     // Standard filler filter
     return l.length > 15 || feedbackLines.length === 1;
  }).join('\n');

  return { 
     feedback: isolatedFeedback || bestFeedback, 
     time, 
     name, 
     role, 
     company, 
     date,
     isSupported: (validSegments.length > 0) || (bestFeedback.length > 30)
  };
}
