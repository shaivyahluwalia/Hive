import express from 'express';
import { dbService } from '../models/dbService.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// GET /api/marketplace/workers
// Return directory of human workers with filters
router.get('/workers', requireAuth, async (req, res) => {
  try {
    const { skills, budget, rating, remote } = req.query;
    let filter = { role: 'Worker' };

    // Fetch all workers
    let workers = await dbService.getUsers(filter);

    // Apply filters in JS for flexibility (works identically in JSON and Mongo modes)
    if (skills) {
      const skillList = skills.split(',').map(s => s.trim().toLowerCase());
      workers = workers.filter(w => 
        w.skills && w.skills.some(skill => skillList.includes(skill.toLowerCase()))
      );
    }

    if (budget) {
      const maxRate = parseFloat(budget);
      workers = workers.filter(w => w.hourlyPrice <= maxRate);
    }

    if (rating) {
      const minRating = parseFloat(rating);
      workers = workers.filter(w => w.rating >= minRating);
    }

    if (remote === 'true') {
      workers = workers.filter(w => w.location.toLowerCase().includes('remote'));
    }

    // Clean sensitive password data
    const cleanWorkers = workers.map(({ password: _, ...rest }) => rest);

    res.json({ workers: cleanWorkers });
  } catch (error) {
    console.error('Fetch workers marketplace error:', error);
    res.status(500).json({ error: 'Failed to query worker marketplace.' });
  }
});

// GET /api/marketplace/agents
// Return active AI agents listing
router.get('/agents', requireAuth, async (req, res) => {
  try {
    const agents = await dbService.getAIAgents();
    res.json({ agents });
  } catch (error) {
    console.error('Fetch AI agents error:', error);
    res.status(500).json({ error: 'Failed to query AI employee marketplace.' });
  }
});

export default router;
