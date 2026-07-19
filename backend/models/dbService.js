import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dbMode } from '../config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const JSON_DB_DIR = path.join(__dirname, '../data');
const JSON_DB_PATH = path.join(JSON_DB_DIR, 'db.json');

// Ensure data directory exists
if (!fs.existsSync(JSON_DB_DIR)) {
  fs.mkdirSync(JSON_DB_DIR, { recursive: true });
}

// ----------------------------------------------------
// 1. Mongoose Schema Definitions
// ----------------------------------------------------

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['Business', 'Worker', 'Admin'], required: true },
  skills: [{ type: String }],
  location: { type: String, default: 'Remote' },
  rating: { type: Number, default: 5 },
  experience: { type: String, default: 'Entry Level' },
  hourlyPrice: { type: Number, default: 0 },
  availability: { type: String, default: 'Available' },
  avatar: { type: String, default: '' },
  resumePath: { type: String, default: null },   // uploaded resume file path
  resumeSkills: { type: String, default: '' },
  resumeExp: { type: String, default: '' },
  resumeBio: { type: String, default: '' },
  portfolio: [{ type: String }],
  reviews: [{
    reviewer: { type: String },
    rating: { type: Number },
    comment: { type: String },
    date: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

const JobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  budget: { type: Number, required: true },
  deadline: { type: String, required: true },
  category: { type: String, required: true },
  workerType: { type: String, required: true }, // 'Human Worker', 'AI Employee', 'Human + AI Collaboration'
  confidence: { type: Number, default: 1.0 },
  reasoning: { type: String },
  status: { type: String, enum: ['Pending', 'In Progress', 'Completed'], default: 'Pending' },
  businessId: { type: String, required: true },
  workerId: { type: String, default: null }, // Hired worker (human or AI agent name)
  applicants: [{ type: String }] // Worker User IDs
}, { timestamps: true });

const AIAgentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true }, // Monthly price or rate
  speed: { type: String, required: true },
  accuracy: { type: String, required: true },
  rating: { type: Number, default: 4.8 },
  icon: { type: String, default: 'Cpu' },
  status: { type: String, default: 'Active' }
}, { timestamps: true });

const MessageSchema = new mongoose.Schema({
  senderId: { type: String, required: true },
  receiverId: { type: String, required: true },
  jobId: { type: String, required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

// Payment / Order model
const PaymentSchema = new mongoose.Schema({
  businessId:  { type: String, required: true },
  workerId:    { type: String, required: true },  // user _id OR AI agent name
  jobId:       { type: String, required: true },
  amount:      { type: Number, required: true },
  currency:    { type: String, default: 'INR' },
  description: { type: String, default: '' },
  method:      { type: String, default: 'mock' }, // 'stripe' | 'mock'
  status:      { type: String, enum: ['pending','paid','failed'], default: 'paid' },
  txnId:       { type: String, default: '' }
}, { timestamps: true });

// Standalone Review model (worker ratings post-job-completion)
const ReviewSchema = new mongoose.Schema({
  jobId:      { type: String, required: true },
  workerId:   { type: String, required: true },
  businessId: { type: String, required: true },
  rating:     { type: Number, required: true, min: 1, max: 5 },
  comment:    { type: String, default: '' }
}, { timestamps: true });

// Compile Mongoose models if connected
let User, Job, AIAgent, Message, Payment, Review;
try {
  User    = mongoose.model('User',    UserSchema);
  Job     = mongoose.model('Job',     JobSchema);
  AIAgent = mongoose.model('AIAgent', AIAgentSchema);
  Message = mongoose.model('Message', MessageSchema);
  Payment = mongoose.model('Payment', PaymentSchema);
  Review  = mongoose.model('Review',  ReviewSchema);
} catch (e) {
  // fallback to JSON adapter
}

// ----------------------------------------------------
// 2. Local JSON Storage Memory Adapter
// ----------------------------------------------------

let jsonDb = {
  users: [],
  jobs: [],
  aiAgents: [],
  messages: [],
  payments: [],
  reviews: []
};

// Load JSON db from disk
const loadJsonDb = () => {
  try {
    if (fs.existsSync(JSON_DB_PATH)) {
      const data = fs.readFileSync(JSON_DB_PATH, 'utf-8');
      jsonDb = JSON.parse(data);
    } else {
      saveJsonDb();
    }
  } catch (err) {
    console.error('Error loading JSON DB:', err);
  }
};

// Save JSON db to disk
const saveJsonDb = () => {
  try {
    fs.writeFileSync(JSON_DB_PATH, JSON.stringify(jsonDb, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving JSON DB:', err);
  }
};

// Load database immediately
loadJsonDb();

// Helper to generate quick random unique IDs
const generateId = () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

// ----------------------------------------------------
// 3. Database Service API
// ----------------------------------------------------

export const dbService = {
  // --- User Operations ---
  getUsers: async (filter = {}) => {
    if (dbMode === 'mongodb') {
      return await User.find(filter).lean();
    } else {
      return jsonDb.users.filter(u => {
        return Object.keys(filter).every(key => {
          if (Array.isArray(filter[key])) {
            return filter[key].every(val => u[key]?.includes(val));
          }
          return u[key] === filter[key];
        });
      });
    }
  },

  getUserById: async (id) => {
    if (dbMode === 'mongodb') {
      return await User.findById(id).lean();
    } else {
      return jsonDb.users.find(u => u._id === id) || null;
    }
  },

  getUserByEmail: async (email) => {
    if (dbMode === 'mongodb') {
      return await User.findOne({ email }).lean();
    } else {
      return jsonDb.users.find(u => u.email === email) || null;
    }
  },

  createUser: async (userObj) => {
    if (dbMode === 'mongodb') {
      const newUser = new User(userObj);
      return (await newUser.save()).toObject();
    } else {
      const newUser = {
        _id: generateId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        reviews: [],
        portfolio: [],
        skills: [],
        ...userObj
      };
      jsonDb.users.push(newUser);
      saveJsonDb();
      return newUser;
    }
  },

  updateUser: async (id, updateObj) => {
    if (dbMode === 'mongodb') {
      return await User.findByIdAndUpdate(id, updateObj, { new: true }).lean();
    } else {
      const idx = jsonDb.users.findIndex(u => u._id === id);
      if (idx !== -1) {
        jsonDb.users[idx] = {
          ...jsonDb.users[idx],
          ...updateObj,
          updatedAt: new Date().toISOString()
        };
        saveJsonDb();
        return jsonDb.users[idx];
      }
      return null;
    }
  },

  deleteUser: async (id) => {
    if (dbMode === 'mongodb') {
      return await User.findByIdAndDelete(id).lean();
    } else {
      const idx = jsonDb.users.findIndex(u => u._id === id);
      if (idx !== -1) {
        const deleted = jsonDb.users.splice(idx, 1)[0];
        saveJsonDb();
        return deleted;
      }
      return null;
    }
  },

  // --- Job Operations ---
  getJobs: async (filter = {}) => {
    if (dbMode === 'mongodb') {
      return await Job.find(filter).sort({ createdAt: -1 }).lean();
    } else {
      let filtered = jsonDb.jobs;
      if (filter.businessId) filtered = filtered.filter(j => j.businessId === filter.businessId);
      if (filter.workerId) filtered = filtered.filter(j => j.workerId === filter.workerId);
      if (filter.status) filtered = filtered.filter(j => j.status === filter.status);
      if (filter.category) filtered = filtered.filter(j => j.category === filter.category);
      return [...filtered].reverse();
    }
  },

  getJobById: async (id) => {
    if (dbMode === 'mongodb') {
      return await Job.findById(id).lean();
    } else {
      return jsonDb.jobs.find(j => j._id === id) || null;
    }
  },

  createJob: async (jobObj) => {
    if (dbMode === 'mongodb') {
      const newJob = new Job(jobObj);
      return (await newJob.save()).toObject();
    } else {
      const newJob = {
        _id: generateId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'Pending',
        applicants: [],
        workerId: null,
        confidence: 1.0,
        ...jobObj
      };
      jsonDb.jobs.push(newJob);
      saveJsonDb();
      return newJob;
    }
  },

  updateJob: async (id, updateObj) => {
    if (dbMode === 'mongodb') {
      return await Job.findByIdAndUpdate(id, updateObj, { new: true }).lean();
    } else {
      const idx = jsonDb.jobs.findIndex(j => j._id === id);
      if (idx !== -1) {
        jsonDb.jobs[idx] = {
          ...jsonDb.jobs[idx],
          ...updateObj,
          updatedAt: new Date().toISOString()
        };
        saveJsonDb();
        return jsonDb.jobs[idx];
      }
      return null;
    }
  },

  // --- AI Agent Operations ---
  getAIAgents: async () => {
    if (dbMode === 'mongodb') {
      return await AIAgent.find({ status: 'Active' }).lean();
    } else {
      return jsonDb.aiAgents.filter(a => a.status === 'Active');
    }
  },

  createAIAgent: async (agentObj) => {
    if (dbMode === 'mongodb') {
      const newAgent = new AIAgent(agentObj);
      return (await newAgent.save()).toObject();
    } else {
      const newAgent = {
        _id: generateId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        rating: 4.8,
        icon: 'Cpu',
        status: 'Active',
        ...agentObj
      };
      jsonDb.aiAgents.push(newAgent);
      saveJsonDb();
      return newAgent;
    }
  },

  // --- Message Operations ---
  getMessages: async (jobId) => {
    if (dbMode === 'mongodb') {
      return await Message.find({ jobId }).sort({ timestamp: 1 }).lean();
    } else {
      return jsonDb.messages.filter(m => m.jobId === jobId);
    }
  },

  // --- Payment Operations ---
  getPayments: async (filter = {}) => {
    if (dbMode === 'mongodb') {
      return await Payment.find(filter).sort({ createdAt: -1 }).lean();
    } else {
      let p = jsonDb.payments;
      if (filter.businessId) p = p.filter(x => x.businessId === filter.businessId);
      if (filter.workerId)   p = p.filter(x => x.workerId   === filter.workerId);
      if (filter.jobId)      p = p.filter(x => x.jobId      === filter.jobId);
      return [...p].reverse();
    }
  },

  createPayment: async (payObj) => {
    if (dbMode === 'mongodb') {
      const p = new Payment(payObj);
      return (await p.save()).toObject();
    } else {
      const p = {
        _id: generateId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        currency: 'INR',
        method: 'mock',
        status: 'paid',
        txnId: 'TXN_' + generateId().toUpperCase().slice(0, 10),
        ...payObj
      };
      jsonDb.payments.push(p);
      saveJsonDb();
      return p;
    }
  },

  // --- Review Operations ---
  getReviews: async (filter = {}) => {
    if (dbMode === 'mongodb') {
      return await Review.find(filter).sort({ createdAt: -1 }).lean();
    } else {
      let r = jsonDb.reviews;
      if (filter.workerId)   r = r.filter(x => x.workerId   === filter.workerId);
      if (filter.businessId) r = r.filter(x => x.businessId === filter.businessId);
      if (filter.jobId)      r = r.filter(x => x.jobId      === filter.jobId);
      return r;
    }
  },

  createReview: async (reviewObj) => {
    if (dbMode === 'mongodb') {
      const r = new Review(reviewObj);
      return (await r.save()).toObject();
    } else {
      const r = {
        _id: generateId(),
        createdAt: new Date().toISOString(),
        ...reviewObj
      };
      jsonDb.reviews.push(r);
      saveJsonDb();
      // Also push into the worker's embedded reviews array
      const workerIdx = jsonDb.users.findIndex(u => u._id === reviewObj.workerId);
      if (workerIdx !== -1) {
        if (!jsonDb.users[workerIdx].reviews) jsonDb.users[workerIdx].reviews = [];
        jsonDb.users[workerIdx].reviews.push({
          reviewer: reviewObj.reviewer || 'Business',
          rating: reviewObj.rating,
          comment: reviewObj.comment || '',
          date: new Date().toISOString()
        });
        // Recompute average rating
        const allRatings = jsonDb.users[workerIdx].reviews.map(rv => rv.rating);
        jsonDb.users[workerIdx].rating = parseFloat(
          (allRatings.reduce((a, b) => a + b, 0) / allRatings.length).toFixed(2)
        );
        saveJsonDb();
      }
      return r;
    }
  },

  createMessage: async (msgObj) => {
    if (dbMode === 'mongodb') {
      const newMsg = new Message(msgObj);
      return (await newMsg.save()).toObject();
    } else {
      const newMsg = {
        _id: generateId(),
        timestamp: new Date().toISOString(),
        ...msgObj
      };
      jsonDb.messages.push(newMsg);
      saveJsonDb();
      return newMsg;
    }
  },

  // Seed standard platform data if empty
  seedData: async () => {
    // Check and seed AI agents
    const agentsCount = dbMode === 'mongodb' ? await AIAgent.countDocuments() : jsonDb.aiAgents.length;
    if (agentsCount === 0) {
      const defaultAgents = [
        { name: 'Content Writer AI', category: 'Writing', description: 'Generates SEO-friendly blogs, marketing copy, and social media captions in seconds.', price: 15, speed: 'Super Fast', accuracy: '95%', icon: 'FileText' },
        { name: 'Graphic Designer AI', category: 'Design', description: 'Creates premium logos, branding assets, custom illustrations, and banner templates.', price: 29, speed: 'Fast', accuracy: '90%', icon: 'Palette' },
        { name: 'Data Analyst AI', category: 'Analytics', description: 'Ingests spreadsheets, builds visual reports, runs statistical tests, and extracts actionable insights.', price: 35, speed: 'Super Fast', accuracy: '99%', icon: 'BarChart' },
        { name: 'Customer Support AI', category: 'Support', description: 'Handles user tickets, queries, FAQs, and handles order status updates with polite, human-like chat.', price: 19, speed: 'Instant', accuracy: '96%', icon: 'MessageSquare' },
        { name: 'Resume Builder AI', category: 'Writing', description: 'Rewrites CVs, constructs tailored cover letters, and optimizes LinkedIn profiles for applicant tracking systems.', price: 9, speed: 'Instant', accuracy: '98%', icon: 'Briefcase' },
        { name: 'Coding Assistant AI', category: 'Development', description: 'Generates boilerplates, debugs compile errors, writes unit tests, and documents API designs.', price: 49, speed: 'Super Fast', accuracy: '92%', icon: 'Code' },
        { name: 'Social Media AI', category: 'Marketing', description: 'Plans editorial schedules, researches trending hashtags, schedules auto-posts, and replies to comments.', price: 25, speed: 'Fast', accuracy: '94%', icon: 'Share2' }
      ];

      for (const a of defaultAgents) {
        if (dbMode === 'mongodb') {
          await new AIAgent(a).save();
        } else {
          jsonDb.aiAgents.push({
            _id: generateId(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            rating: 4.8,
            status: 'Active',
            ...a
          });
        }
      }
      if (dbMode === 'json') saveJsonDb();
      console.log('Seeded default AI agents.');
    }
  }
};
