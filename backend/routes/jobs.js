import express from 'express';
import { dbService } from '../models/dbService.js';
import { requireAuth } from '../middleware/auth.js';
import { predictWorkerType } from '../services/aiService.js';

const router = express.Router();

// GET /api/jobs
// List jobs based on user role and query filters
router.get('/', requireAuth, async (req, res) => {
  try {
    const { role, id } = req.user;
    let filter = {};

    if (role === 'Business') {
      filter.businessId = id;
    } else if (role === 'Worker') {
      // Workers see:
      // 1. Jobs they are hired for (workerId === id)
      // 2. Or jobs that are still pending (open for application)
      const { filterType } = req.query; // 'assigned' or 'open'
      
      if (filterType === 'assigned') {
        filter.workerId = id;
      } else {
        filter.status = 'Pending';
      }
    }

    const jobs = await dbService.getJobs(filter);
    
    // Resolve applicant details for frontend
    const enrichedJobs = await Promise.all(jobs.map(async (job) => {
      let enrichedApplicants = [];
      if (job.applicants && job.applicants.length > 0) {
        for (const appId of job.applicants) {
          const appUser = await dbService.getUserById(appId);
          if (appUser) {
            enrichedApplicants.push({
              _id: appUser._id,
              username: appUser.username,
              email: appUser.email,
              skills: appUser.skills,
              rating: appUser.rating,
              hourlyPrice: appUser.hourlyPrice,
              avatar: appUser.avatar
            });
          }
        }
      }
      
      let hiredWorkerDetails = null;
      if (job.workerId) {
        const workerUser = await dbService.getUserById(job.workerId);
        if (workerUser) {
          hiredWorkerDetails = {
            _id: workerUser._id,
            username: workerUser.username,
            email: workerUser.email,
            avatar: workerUser.avatar,
            role: 'Human'
          };
        } else {
          // It could be an AI agent name (e.g. "Content Writer AI")
          hiredWorkerDetails = {
            _id: 'ai',
            username: job.workerId,
            avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(job.workerId)}`,
            role: 'AI'
          };
        }
      }

      return {
        ...job,
        applicantDetails: enrichedApplicants,
        hiredWorkerDetails
      };
    }));

    res.json({ jobs: enrichedJobs });
  } catch (error) {
    console.error('Fetch jobs error:', error);
    res.status(500).json({ error: 'Failed to retrieve jobs.' });
  }
});

// GET /api/jobs/:id
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const job = await dbService.getJobById(req.params.id);
    if (!job) {
      return res.status(404).json({ error: 'Job not found.' });
    }

    // Verify authorization: only the posting business or applying workers can see details
    const isOwner = job.businessId === req.user.id;
    const isWorker = job.workerId === req.user.id || job.applicants.includes(req.user.id);
    const isAdmin = req.user.role === 'Admin';

    if (!isOwner && !isWorker && !isAdmin) {
      return res.status(403).json({ error: 'Forbidden: You do not have access to this job.' });
    }

    // Populate business details
    const businessUser = await dbService.getUserById(job.businessId);
    const businessDetails = businessUser ? {
      username: businessUser.username,
      email: businessUser.email,
      avatar: businessUser.avatar
    } : null;

    // Populate applicant profiles
    const applicantDetails = [];
    for (const appId of job.applicants) {
      const appUser = await dbService.getUserById(appId);
      if (appUser) {
        applicantDetails.push({
          _id: appUser._id,
          username: appUser.username,
          email: appUser.email,
          skills: appUser.skills,
          rating: appUser.rating,
          hourlyPrice: appUser.hourlyPrice,
          avatar: appUser.avatar
        });
      }
    }

    let hiredWorkerDetails = null;
    if (job.workerId) {
      const workerUser = await dbService.getUserById(job.workerId);
      if (workerUser) {
        hiredWorkerDetails = {
          _id: workerUser._id,
          username: workerUser.username,
          email: workerUser.email,
          avatar: workerUser.avatar,
          role: 'Human'
        };
      } else {
        hiredWorkerDetails = {
          _id: 'ai',
          username: job.workerId,
          avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(job.workerId)}`,
          role: 'AI'
        };
      }
    }

    res.json({
      job: {
        ...job,
        businessDetails,
        applicantDetails,
        hiredWorkerDetails
      }
    });
  } catch (error) {
    console.error('Fetch job by ID error:', error);
    res.status(500).json({ error: 'Failed to retrieve job details.' });
  }
});

// POST /api/jobs
// Creates a new job posting and triggers AI worker classification
router.post('/', requireAuth, async (req, res) => {
  try {
    const { title, description, budget, deadline, category } = req.body;

    if (!title || !description || !budget || !deadline || !category) {
      return res.status(400).json({ error: 'All job fields are required.' });
    }

    if (req.user.role !== 'Business') {
      return res.status(403).json({ error: 'Only business accounts can post jobs.' });
    }

    // Call Gemini or fallback model to predict worker type
    const aiPrediction = await predictWorkerType(title, description, category, parseFloat(budget));

    const jobObj = {
      title,
      description,
      budget: parseFloat(budget),
      deadline,
      category,
      workerType: aiPrediction.workerType,
      confidence: aiPrediction.confidence,
      reasoning: aiPrediction.reasoning,
      businessId: req.user.id,
      status: 'Pending'
    };

    const newJob = await dbService.createJob(jobObj);

    res.status(201).json({
      message: 'Job posted successfully with AI classification.',
      job: newJob
    });
  } catch (error) {
    console.error('Create job error:', error);
    res.status(500).json({ error: 'Failed to create job posting.' });
  }
});

// POST /api/jobs/:id/apply
// Human worker applies to a job post
router.post('/:id/apply', requireAuth, async (req, res) => {
  try {
    if (req.user.role !== 'Worker') {
      return res.status(403).json({ error: 'Only human workers can apply to jobs.' });
    }

    const job = await dbService.getJobById(req.params.id);
    if (!job) {
      return res.status(404).json({ error: 'Job not found.' });
    }

    if (job.status !== 'Pending') {
      return res.status(400).json({ error: 'This job is no longer accepting applications.' });
    }

    if (job.applicants.includes(req.user.id)) {
      return res.status(400).json({ error: 'You have already applied to this job.' });
    }

    const updatedApplicants = [...job.applicants, req.user.id];
    const updatedJob = await dbService.updateJob(req.params.id, { applicants: updatedApplicants });

    res.json({ message: 'Application submitted successfully.', job: updatedJob });
  } catch (error) {
    console.error('Apply to job error:', error);
    res.status(500).json({ error: 'Failed to submit application.' });
  }
});

// POST /api/jobs/:id/action
// Business hiring decisions (hire human, launch AI agent, or complete job)
router.post('/:id/action', requireAuth, async (req, res) => {
  try {
    const { action, workerId, agentName } = req.body;

    if (req.user.role !== 'Business') {
      return res.status(403).json({ error: 'Forbidden: Access restricted to business accounts.' });
    }

    const job = await dbService.getJobById(req.params.id);
    if (!job) {
      return res.status(404).json({ error: 'Job not found.' });
    }

    if (job.businessId !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden: You do not own this job posting.' });
    }

    if (action === 'hire') {
      // Hiring a human worker from applicants
      if (!workerId) {
        return res.status(400).json({ error: 'workerId is required to hire a worker.' });
      }

      if (!job.applicants.includes(workerId)) {
        return res.status(400).json({ error: 'Target user has not applied to this job.' });
      }

      const updatedJob = await dbService.updateJob(req.params.id, {
        status: 'In Progress',
        workerId: workerId
      });

      // Send automated job contract starting message
      await dbService.createMessage({
        senderId: req.user.id,
        receiverId: workerId,
        jobId: job._id,
        content: `System Alert: Business has hired you for the job "${job.title}". The contract is now active!`
      });

      return res.json({ message: 'Worker hired successfully.', job: updatedJob });
    } 
    
    if (action === 'hire_ai') {
      // Launching an AI agent for the job
      if (!agentName) {
        return res.status(400).json({ error: 'agentName is required to launch AI employee.' });
      }

      const updatedJob = await dbService.updateJob(req.params.id, {
        status: 'In Progress',
        workerId: agentName // Store AI agent name
      });

      // AI employee automatically logs a welcome message in the thread
      await dbService.createMessage({
        senderId: 'ai',
        receiverId: req.user.id,
        jobId: job._id,
        content: `Hello! I am the ${agentName}. I have successfully initialized my runtime and started working on "${job.title}". I will analyze the task details and provide solutions shortly!`
      });

      return res.json({ message: 'AI Employee launched successfully.', job: updatedJob });
    }

    if (action === 'complete') {
      // Marking job contract as completed
      if (job.status !== 'In Progress') {
        return res.status(400).json({ error: 'Only jobs "In Progress" can be completed.' });
      }

      const updatedJob = await dbService.updateJob(req.params.id, {
        status: 'Completed'
      });

      // If it was hired by AI, let AI leave a sign-off message
      if (job.workerId && !await dbService.getUserById(job.workerId)) {
        await dbService.createMessage({
          senderId: 'ai',
          receiverId: req.user.id,
          jobId: job._id,
          content: `Task Completed! I have finished generating resources for "${job.title}" and saved the outputs in the workspace logs. Feel free to review or request revisions!`
        });
      } else if (job.workerId) {
        // Human worker message
        await dbService.createMessage({
          senderId: req.user.id,
          receiverId: job.workerId,
          jobId: job._id,
          content: `System Alert: Business has marked the job "${job.title}" as Completed. Thank you for your work!`
        });
      }

      return res.json({ message: 'Job completed successfully.', job: updatedJob });
    }

    res.status(400).json({ error: 'Invalid action parameter.' });
  } catch (error) {
    console.error('Job action error:', error);
    res.status(500).json({ error: 'Failed to perform job action.' });
  }
});

export default router;
