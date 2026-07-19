import crypto from 'crypto';

/**
 * Predicts the best worker type and provides recommendations for a job posting.
 */
export async function predictWorkerType(title, description, category, budget) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`;
      const prompt = `Analyze the following job details and determine:
1. The best worker type (strictly return one of: "Human Worker", "AI Employee", or "Human + AI Collaboration").
2. A confidence score (a number between 0.0 and 1.0).
3. A detailed, premium-quality business reasoning (2-3 sentences) justifying this choice.
4. Suggested specific AI agents or key skills to solve the task.

Job Posting:
- Title: "${title}"
- Description: "${description}"
- Category: "${category}"
- Budget: $${budget}

You must return ONLY a raw JSON object in the following format (no markdown code blocks, no backticks, no other text):
{
  "workerType": "...",
  "confidence": 0.95,
  "reasoning": "...",
  "suggestions": ["Agent Name or Skill", ...]
}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }]
        })
      });

      if (!response.ok) {
        throw new Error(`Gemini API returned status ${response.status}`);
      }

      const data = await response.json();
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      
      // Clean up markdown block styling if returned
      const cleanJson = rawText
        .replace(/```json/gi, '')
        .replace(/```/g, '')
        .trim();

      const parsed = JSON.parse(cleanJson);
      if (parsed.workerType && parsed.confidence && parsed.reasoning) {
        return {
          workerType: parsed.workerType,
          confidence: parseFloat(parsed.confidence),
          reasoning: parsed.reasoning,
          suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : []
        };
      }
    } catch (err) {
      console.warn('Gemini API call failed, using local prediction engine:', err.message);
    }
  }

  // Fallback keyword-based recommendation engine
  return localPredict(title, description, category, budget);
}

/**
 * Handles predictions for general assistant chats using Gemini and Mem0 context.
 */
/**
 * Handles predictions for general assistant chats using Gemini and Mem0 context.
 */
export async function getAssistantResponse(message) {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    console.warn("No Gemini API key found in .env!");
    return { 
      recommendation: 'Human + AI Collaboration',
      reasoning: "I am currently in offline mode. Please add a Gemini API key.",
      suggestions: []
    };
  }

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`;
    
    const prompt = `You are Hive, a smart AI assistant for a talent platform that offers both human freelancers and AI employees.
Analyze the user's request and past memory context to recommend whether they should hire an "AI Employee", a "Human Worker", or use "Human + AI Collaboration".

Here is the prompt and memory context:
${message}

You must return ONLY a raw JSON object in the exact format below (no markdown code blocks, no backticks, no text outside the object structure):
{
  "recommendation": "Human Worker" or "AI Employee" or "Human + AI Collaboration",
  "reasoning": "A highly specific, custom response to their message utilizing what you know about them (1-2 sentences).",
  "suggestions": ["Profile or Agent Name 1", "Profile or Agent Name 2"]
}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json"
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Google API Status ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    // Because of responseMimeType, we no longer need regex to clean markdown!
    const parsed = JSON.parse(rawText.trim());
    
    if (parsed.recommendation && parsed.reasoning) {
      return {
        recommendation: parsed.recommendation,
        reasoning: parsed.reasoning,
        suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : []
      };
    }
    
    // NEW ERROR MESSAGE
    throw new Error("Missing required properties in Gemini output");
  } catch (error) {
    console.error("\n========================================");
    console.error("🚨 DEBUG: GEMINI ASSISTANT ERROR CRASH");
    console.error(error.message);
    console.error("========================================\n");
    
    return {
      recommendation: 'Human + AI Collaboration',
      reasoning: 'For general complex tasks, we recommend a combined approach: a human coordinator managing data processing with the support of AI analytics tools.',
      suggestions: ['Data Analyst AI', 'Business Freelancer']
    };
  }
}

function localPredict(title, description, category, budget) {
  const fullText = `${title} ${description} ${category}`.toLowerCase();
  
  const physicalKeywords = [
    'wedding', 'photography', 'photo shoot', 'shoot', 'video', 'videography', 
    'plumber', 'electrician', 'handyman', 'cleaner', 'cleaning', 'chef', 'cook', 
    'delivery', 'courier', 'fitness', 'trainer', 'in-person', 'physical', 'repair'
  ];
  
  const aiKeywords = [
    'write blog', 'blog post', 'caption', 'instagram', 'social media', 'draft', 
    'email response', 'copywriter', 'seo text', 'transcription', 'cv', 'resume', 
    'spreadsheet', 'excel', 'data entry', 'data extraction', 'customer support', 
    'ticket resolver', 'faq responses'
  ];

  // 1. Strict Physical/In-person Check -> Human
  if (
    category === 'Photography' || 
    category === 'Events' || 
    physicalKeywords.some(kw => fullText.includes(kw))
  ) {
    return {
      workerType: 'Human Worker',
      confidence: 0.95,
      reasoning: 'This task requires physical execution, specialized human dexterity, or emotional engagement (e.g. live event photography, maintenance) which cannot be simulated by digital AI.',
      suggestions: ['Professional Photographer', 'Event Coordinator', 'Local Freelancer']
    };
  }

  // 2. Clear-cut Digital Administration & Copywriting -> AI Employee
  if (
    category === 'Writing' || 
    category === 'Customer Support' || 
    aiKeywords.some(kw => fullText.includes(kw))
  ) {
    if (budget > 400) {
      return {
        workerType: 'Human + AI Collaboration',
        confidence: 0.88,
        reasoning: 'While the content production itself is fully automatable, the high budget and volume suggest a need for strategic human editing and quality control alongside AI content generation.',
        suggestions: ['Content Writer AI', 'Social Media AI', 'Freelance Copy Editor']
      };
    } else {
      let suggested = 'Content Writer AI';
      if (fullText.includes('support') || fullText.includes('help') || fullText.includes('faq')) {
        suggested = 'Customer Support AI';
      } else if (fullText.includes('excel') || fullText.includes('data') || fullText.includes('sheet')) {
        suggested = 'Data Analyst AI';
      } else if (fullText.includes('resume') || fullText.includes('cv')) {
        suggested = 'Resume Builder AI';
      } else if (fullText.includes('social') || fullText.includes('instagram') || fullText.includes('post')) {
        suggested = 'Social Media AI';
      }
      return {
        workerType: 'AI Employee',
        confidence: 0.94,
        reasoning: 'This standard digital/copywriting task is easily addressed by pre-trained language models. An AI Employee can execute it instantly at a fraction of human consulting costs.',
        suggestions: [suggested]
      };
    }
  }

  // 3. Technical Development / Design -> Hybrid or AI
  if (
    category === 'Design' || 
    category === 'Development' || 
    fullText.includes('code') || 
    fullText.includes('website') || 
    fullText.includes('logo') || 
    fullText.includes('app') || 
    fullText.includes('software')
  ) {
    if (budget > 1200) {
      return {
        workerType: 'Human + AI Collaboration',
        confidence: 0.90,
        reasoning: 'Building enterprise software or custom brands requires deep human architectural planning, security design, and client feedback cycles, accelerated by AI assistants coding boilerplates.',
        suggestions: ['Coding Assistant AI', 'Graphic Designer AI', 'Senior Fullstack Freelancer']
      };
    } else if (budget < 150) {
      const suggested = category === 'Design' ? 'Graphic Designer AI' : 'Coding Assistant AI';
      return {
        workerType: 'AI Employee',
        confidence: 0.86,
        reasoning: 'Small-scale coding bugs, script writing, or logo visual generation can be tackled autonomously by an AI Employee for immediate turnarounds.',
        suggestions: [suggested]
      };
    } else {
      return {
        workerType: 'Human + AI Collaboration',
        confidence: 0.84,
        reasoning: 'We recommend a combined approach. Hire a developer or designer to scope, review, and fine-tune, while leveraging Coding and Design AI agents to write components and produce design assets.',
        suggestions: ['Coding Assistant AI', 'Graphic Designer AI', 'Freelancer Partner']
      };
    }
  }

  // 4. Default Fallback
  return {
    workerType: 'Human + AI Collaboration',
    confidence: 0.75,
    reasoning: 'This project is multi-dimensional. A hybrid workflow is best: a human manager oversees the strategic planning while AI agents handle bulk data processing and drafting.',
    suggestions: ['Data Analyst AI', 'Business Administrator']
  };
}


/**
 * Converts text into speech using Gnani's Timbre model (TTS)
 */
export async function textToSpeechGnani(text, agentName = '') {
  const apiKey = process.env.GNANI_API_KEY;
  if (!apiKey) {
    throw new Error('Gnani API key missing in environment configuration.');
  }

  // Map Hive's AI Agents to Gnani's standard voice personas
  let voicePersona = 'Kaveri'; // Default voice
  if (agentName.includes('Writer') || agentName.includes('Social')) {
    voicePersona = 'Kaveri';  // Confident, Bright
  } else if (agentName.includes('HR')) {
    voicePersona = 'Shubhra'; // Gentle, Expressive
  } else if (agentName.includes('Data') || agentName.includes('Analyst')) {
    voicePersona = 'Pranav';  // Bold, Trustworthy
  } else if (agentName.includes('Coding')) {
    voicePersona = 'Deepak';  // Grounded, Conversational
  }

  const url = 'https://api.vachana.ai/api/v1/tts/inference';
  
  const payload = {
    text: text,
    voice: voicePersona,
    model: "vachana-voice-v3",
    audio_config: {
      container: "wav",
      encoding: "linear_pcm",
      num_channels: 1,
      sample_rate: 44100,
      sample_width: 2
    }
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key-ID': apiKey
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gnani TTS API returned status ${response.status}: ${errText}`);
  }

  // Return binary arrayBuffer converted to a Node Buffer object
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

/**
 * Transcribes audio file data to text using Gnani's Prisma model (STT)
 */
// ADD languageCode to the function arguments
export async function speechToTextGnani(audioBuffer, mimeType = 'audio/wav', languageCode = 'en-IN') {
  const apiKey = process.env.GNANI_API_KEY;
  if (!apiKey) {
    throw new Error('Gnani API key missing.');
  }

  const url = 'https://api.vachana.ai/stt/v3';
  const boundary = `----NodeFetchFormBoundary${crypto.randomBytes(16).toString('hex')}`;
  
  let headerPayload = `--${boundary}\r\n`;
  headerPayload += `Content-Disposition: form-data; name="audio_file"; filename="input.wav"\r\n`;
  headerPayload += `Content-Type: ${mimeType}\r\n\r\n`;

  let footerPayload = `\r\n--${boundary}\r\n`;
  // INJECT the dynamic languageCode here instead of hardcoding 'en-IN'
  footerPayload += `Content-Disposition: form-data; name="language_code"\r\n\r\n${languageCode}\r\n`; 
  footerPayload += `--${boundary}\r\n`;
  // ... rest of the payload stays exactly the same
  footerPayload += `Content-Disposition: form-data; name="format"\r\n\r\ntranscribe\r\n`;
  footerPayload += `--${boundary}\r\n`;
  footerPayload += `Content-Disposition: form-data; name="itn_native_numerals"\r\n\r\ntrue\r\n`; 
  footerPayload += `--${boundary}--\r\n`;

  const bodyBuffer = Buffer.concat([
    Buffer.from(headerPayload, 'utf-8'),
    audioBuffer,
    Buffer.from(footerPayload, 'utf-8')
  ]);

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': `multipart/form-data; boundary=${boundary}`,
      'X-API-Key-ID': apiKey
    },
    body: bodyBuffer
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gnani STT API returned status ${response.status}: ${errText}`);
  }

  const data = await response.json();
  return data.transcript || '';
}