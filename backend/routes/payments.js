import express from 'express';
import { dbService } from '../models/dbService.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

/**
 * POST /api/payments
 * Business creates a payment record after hiring a worker or AI agent.
 * Body: { jobId, workerId, amount, description }
 */
router.post('/', requireAuth, async (req, res) => {
  try {
    if (req.user.role !== 'Business') {
      return res.status(403).json({ error: 'Only business accounts can create payments.' });
    }

    const { jobId, workerId, amount, description } = req.body;

    if (!jobId || !workerId || amount === undefined) {
      return res.status(400).json({ error: 'jobId, workerId, and amount are required.' });
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({ error: 'Amount must be a positive number.' });
    }

    // Verify the job exists and belongs to this business
    const job = await dbService.getJobById(jobId);
    if (!job) {
      return res.status(404).json({ error: 'Job not found.' });
    }
    if (job.businessId !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden: This job does not belong to you.' });
    }

    const payment = await dbService.createPayment({
      businessId:  req.user.id,
      workerId:    String(workerId),
      jobId:       String(jobId),
      amount:      parsedAmount,
      currency:    'INR',
      description: String(description || '').slice(0, 300),
      method:      'mock',
      status:      'paid'
    });

    res.status(201).json({
      message: 'Payment recorded successfully.',
      payment
    });
  } catch (error) {
    console.error('Create payment error:', error);
    res.status(500).json({ error: 'Failed to create payment record.' });
  }
});

/**
 * GET /api/payments
 * Returns payment history for the authenticated user.
 * Business → their outgoing payments.
 * Worker   → payments received (where workerId matches).
 * Admin    → all payments.
 */
router.get('/', requireAuth, async (req, res) => {
  try {
    let filter = {};
    if (req.user.role === 'Business') {
      filter.businessId = req.user.id;
    } else if (req.user.role === 'Worker') {
      filter.workerId = req.user.id;
    }
    // Admin: no filter → all payments

    const payments = await dbService.getPayments(filter);
    res.json({ payments });
  } catch (error) {
    console.error('Get payments error:', error);
    res.status(500).json({ error: 'Failed to retrieve payments.' });
  }
});

/**
 * GET /api/payments/job/:jobId
 * Returns all payment records for a specific job.
 */
router.get('/job/:jobId', requireAuth, async (req, res) => {
  try {
    const payments = await dbService.getPayments({ jobId: req.params.jobId });
    res.json({ payments });
  } catch (error) {
    console.error('Get payments by job error:', error);
    res.status(500).json({ error: 'Failed to retrieve payments for this job.' });
  }
});

export default router;
