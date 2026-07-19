import express from 'express';
import { dbService } from '../models/dbService.js';
import { requireAuth } from '../middleware/auth.js';
import { getAssistantResponse } from '../services/aiService.js';

const router = express.Router();

// GET /api/chat/:jobId
// Retrieve conversation history for a job
router.get('/:jobId', requireAuth, async (req, res) => {
  try {
    const job = await dbService.getJobById(req.params.jobId);
    if (!job) {
      return res.status(404).json({ error: 'Job not found.' });
    }

    // Verify access
    const isOwner = job.businessId === req.user.id;
    const isWorker = job.workerId === req.user.id;
    const isAdmin = req.user.role === 'Admin';
    // If worker type is AI, the business can talk directly to "ai"
    const isAIConvo = job.workerId && !await dbService.getUserById(job.workerId) && isOwner;

    if (!isOwner && !isWorker && !isAdmin && !isAIConvo) {
      return res.status(403).json({ error: 'Forbidden: You do not have access to this chat.' });
    }

    const messages = await dbService.getMessages(req.params.jobId);
    res.json({ messages });
  } catch (error) {
    console.error('Fetch messages error:', error);
    res.status(500).json({ error: 'Failed to retrieve message logs.' });
  }
});

// POST /api/chat/send
// Send message in job thread. Triggers immediate simulated AI response if the worker is an AI Agent
router.post('/send', requireAuth, async (req, res) => {
  try {
    const { jobId, content } = req.body;

    if (!jobId || !content) {
      return res.status(400).json({ error: 'Job ID and message content are required.' });
    }

    const job = await dbService.getJobById(jobId);
    if (!job) {
      return res.status(404).json({ error: 'Job not found.' });
    }

    // Determine receiver
    let receiverId = '';
    const isBusinessSender = req.user.id === job.businessId;

    if (isBusinessSender) {
      receiverId = job.workerId || 'unassigned';
    } else if (req.user.id === job.workerId) {
      receiverId = job.businessId;
    } else {
      return res.status(403).json({ error: 'Forbidden: You are not a participant in this job contract.' });
    }

    // Save business or worker message
    const newMessage = await dbService.createMessage({
      senderId: req.user.id,
      receiverId,
      jobId,
      content
    });

    // Check if receiver is an AI Employee (meaning workerId is set to an AI Agent name and user record doesn't exist)
    const isAIWorker = job.workerId && !(await dbService.getUserById(job.workerId));

    if (isBusinessSender && isAIWorker) {
      // Trigger instant AI Agent response in the thread
      const agentName = job.workerId;
      let aiResponseContent = '';

      const apiKey = process.env.GEMINI_API_KEY;
      if (apiKey) {
        try {
          const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
          const prompt = `You are "${agentName}", an AI employee hired by a business client for the job "${job.title}" (Description: "${job.description}").
The client just wrote to you: "${content}"

Reply to the client as this professional AI Agent. Keep your answer highly professional, task-focused, and concise (3-5 sentences). Do not include any meta-talk or JSON brackets, write it as a direct message response.`;

          const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }]
            })
          });

          if (response.ok) {
            const data = await response.json();
            aiResponseContent = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
          }
        } catch (err) {
          console.warn('AI agent reply call failed, falling back to mock reply:', err.message);
        }
      }

      // Local mock replies for AI Agents if Gemini fails or key is missing
      if (!aiResponseContent) {
        const lowerContent = content.toLowerCase();
        if (agentName.includes('Writer') || agentName.includes('Social')) {
          if (lowerContent.includes('draft') || lowerContent.includes('write') || lowerContent.includes('post')) {
            aiResponseContent = `Here is a draft sample for your review:\n\n"🚀 Elevate your productivity with Hive – where AI efficiency meets human creativity! Discover the future of remote teamwork. #FutureOfWork #AI #WorkforcePlatform"\n\nLet me know if you would like me to rewrite or adjust the tone.`;
          } else {
            aiResponseContent = `Understood. I am adjusting the draft content parameters based on your guidelines. I will optimize the wording, tone, and formatting. Please let me know if there are specific keywords you'd like included.`;
          }
        } else if (agentName.includes('Designer')) {
          aiResponseContent = `I have updated the layout elements and typography. I am using a minimalist, premium layout with a dark theme background, featuring a (#7C3AED) purple glowing outline to align with modern aesthetic standards. You can preview the mockup details shortly!`;
        } else if (agentName.includes('Data') || agentName.includes('Analyst')) {
          aiResponseContent = `Injesting data parameters. I have processed the rows and identified a 32% increase in productivity while reducing core overhead costs by 45%. I will render these analytics into custom SVG dashboard charts.`;
        } else {
          aiResponseContent = `Thank you for the update. I have updated my task execution stack. I will execute these operations and output results here. Let me know if you need anything else!`;
        }
      }

      // Save AI reply in database
      const aiMessage = await dbService.createMessage({
        senderId: 'ai',
        receiverId: req.user.id,
        jobId,
        content: aiResponseContent.trim()
      });

      return res.json({
        message: 'Message sent.',
        userMessage: newMessage,
        aiMessage: aiMessage
      });
    }

    res.json({ message: 'Message sent.', userMessage: newMessage });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Failed to send message.' });
  }
});

// POST /api/chat/assistant
// Floating chatbot recommendations query endpoint
router.post('/assistant', requireAuth, async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message content is required.' });
    }

    const aiResponse = await getAssistantResponse(message);
    res.json(aiResponse);
  } catch (error) {
    console.error('Chat assistant error:', error);
    res.status(500).json({ error: 'Assistant failed to generate response.' });
  }
});

export default router;
