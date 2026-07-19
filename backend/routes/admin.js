import express from 'express';
import { dbService } from '../models/dbService.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Enforce auth and admin role check on all admin routes
router.use(requireAuth, requireRole(['Admin']));

// GET /api/admin/stats
// Aggregate global platform analytics
router.get('/stats', async (req, res) => {
  try {
    const users = await dbService.getUsers({});
    const jobs = await dbService.getJobs({});
    
    const businessCount = users.filter(u => u.role === 'Business').length;
    const workerCount = users.filter(u => u.role === 'Worker').length;
    
    const pendingJobs = jobs.filter(j => j.status === 'Pending').length;
    const inProgressJobs = jobs.filter(j => j.status === 'In Progress').length;
    const completedJobs = jobs.filter(j => j.status === 'Completed').length;
    
    // Total platform volume
    const totalSpend = jobs
      .filter(j => j.status === 'In Progress' || j.status === 'Completed')
      .reduce((sum, j) => sum + j.budget, 0);

    // AI task indicators
    const aiJobs = jobs.filter(j => j.workerId && !users.find(u => u._id === j.workerId));
    const activeAiTasks = aiJobs.filter(j => j.status === 'In Progress').length;
    const completedAiTasks = aiJobs.filter(j => j.status === 'Completed').length;
    
    // Savings calculation: Assume AI execution saves 85% compared to human budget
    const aiSpend = aiJobs.reduce((sum, j) => sum + j.budget, 0);
    const estimatedSavings = aiSpend * 0.85;

    res.json({
      stats: {
        totalUsers: users.length,
        businessCount,
        workerCount,
        totalJobs: jobs.length,
        pendingJobs,
        inProgressJobs,
        completedJobs,
        totalSpend,
        activeAiTasks,
        completedAiTasks,
        estimatedSavings
      }
    });
  } catch (error) {
    console.error('Fetch admin stats error:', error);
    res.status(500).json({ error: 'Failed to aggregate administrative metrics.' });
  }
});

// GET /api/admin/users
router.get('/users', async (req, res) => {
  try {
    const users = await dbService.getUsers({});
    const cleanUsers = users.map(({ password: _, ...rest }) => rest);
    res.json({ users: cleanUsers });
  } catch (error) {
    console.error('Fetch admin users error:', error);
    res.status(500).json({ error: 'Failed to retrieve user accounts.' });
  }
});

// GET /api/admin/jobs
router.get('/jobs', async (req, res) => {
  try {
    const jobs = await dbService.getJobs({});
    res.json({ jobs });
  } catch (error) {
    console.error('Fetch admin jobs error:', error);
    res.status(500).json({ error: 'Failed to retrieve system job postings.' });
  }
});

// DELETE /api/admin/users/:id
router.delete('/users/:id', async (req, res) => {
  try {
    const deleted = await dbService.deleteUser(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'User account not found.' });
    }
    res.json({ message: 'User account deleted successfully.', user: deleted });
  } catch (error) {
    console.error('Delete user account error:', error);
    res.status(500).json({ error: 'Failed to terminate user account.' });
  }
});

export default router;
