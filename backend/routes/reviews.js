import express from 'express';
import { dbService } from '../models/dbService.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

/**
 * POST /api/reviews
 * Business submits a star rating + comment for a worker after job completion.
 * Body: { jobId, workerId, rating (1-5), comment }
 */
router.post('/', requireAuth, async (req, res) => {
  try {
    if (req.user.role !== 'Business') {
      return res.status(403).json({ error: 'Only business accounts can submit reviews.' });
    }

    const { jobId, workerId, rating, comment } = req.body;

    if (!jobId || !workerId || rating === undefined) {
      return res.status(400).json({ error: 'jobId, workerId, and rating are required.' });
    }

    const parsedRating = parseFloat(rating);
    if (isNaN(parsedRating) || parsedRating < 1 || parsedRating > 5) {
      return res.status(400).json({ error: 'Rating must be a number between 1 and 5.' });
    }

    // Verify job exists, belongs to this business, and is completed
    const job = await dbService.getJobById(jobId);
    if (!job) {
      return res.status(404).json({ error: 'Job not found.' });
    }
    if (job.businessId !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden: This job does not belong to you.' });
    }
    if (job.status !== 'Completed') {
      return res.status(400).json({ error: 'You can only review a completed job.' });
    }

    // Prevent duplicate review for same job
    const existing = await dbService.getReviews({ jobId, businessId: req.user.id });
    if (existing.length > 0) {
      return res.status(400).json({ error: 'You have already submitted a review for this job.' });
    }

    // Get business name to embed in worker's review list
    const business = await dbService.getUserById(req.user.id);

    const review = await dbService.createReview({
      jobId:      String(jobId),
      workerId:   String(workerId),
      businessId: req.user.id,
      rating:     parsedRating,
      comment:    String(comment || '').slice(0, 800),
      reviewer:   business?.username || 'Business'
    });

    res.status(201).json({
      message: 'Review submitted successfully.',
      review
    });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({ error: 'Failed to submit review.' });
  }
});

/**
 * GET /api/reviews/worker/:workerId
 * Returns all reviews for a specific worker (public).
 */
router.get('/worker/:workerId', async (req, res) => {
  try {
    const reviews = await dbService.getReviews({ workerId: req.params.workerId });
    const avg = reviews.length
      ? parseFloat((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(2))
      : null;
    res.json({ reviews, averageRating: avg, count: reviews.length });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({ error: 'Failed to retrieve reviews.' });
  }
});

/**
 * GET /api/reviews/my
 * Returns all reviews written by the authenticated business.
 */
router.get('/my', requireAuth, async (req, res) => {
  try {
    if (req.user.role !== 'Business') {
      return res.status(403).json({ error: 'Only business accounts can view their reviews.' });
    }
    const reviews = await dbService.getReviews({ businessId: req.user.id });
    res.json({ reviews });
  } catch (error) {
    console.error('Get my reviews error:', error);
    res.status(500).json({ error: 'Failed to retrieve your reviews.' });
  }
});

export default router;
