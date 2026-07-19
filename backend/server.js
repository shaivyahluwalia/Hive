import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { connectDB, dbMode } from './config/db.js';
import { dbService } from './models/dbService.js';
import { csrfProtection } from './middleware/csrf.js';
import { fileURLToPath } from 'url';
import pathMod from 'path';

// Load route modules
import authRouter from './routes/auth.js';
import jobsRouter from './routes/jobs.js';
import marketplaceRouter from './routes/marketplace.js';
import chatRouter from './routes/chat.js';
import adminRouter from './routes/admin.js';
import agentsRouter from './routes/agents.js';
import resumeRouter from './routes/resume.js';
import paymentsRouter from './routes/payments.js'; // Teammate's route
import reviewsRouter from './routes/reviews.js';
import paymentRouter from './routes/payment.js';  // Your AI agent route

// Rate limiting middleware
import { authLimiter, signupLimiter, apiLimiter } from './middleware/rateLimiter.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to Database (MongoDB or JSON file fallback)
await connectDB();

// ----------------------------------------------------
// Middleware Setup
// ----------------------------------------------------

// CORS configuration supporting credentials from local frontend
app.use(cors({
  origin: [
    "http://localhost:3000",
    "http://localhost:3001",
    "https://hive-chi-seven.vercel.app"
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-CSRF-Token"
  ]
}));

// BOOST PAYLOAD LIMITS FOR BASE64 STRINGS
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser());

// Serve uploaded resume files (authenticated download handled in route)
const __filename2 = fileURLToPath(import.meta.url);
const __dirname2 = pathMod.dirname(__filename2);
app.use('/uploads', express.static(pathMod.join(__dirname2, '../uploads')));

// Security Headers Middleware
app.use((req, res, next) => {
  // Prevent content type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');

  // ALLOW MICROPHONE ACCESS ON LOCALHOST FOR DEVELOPMENT
  res.setHeader('Permission-Policy', 'camera=(), microphone=(self "http://localhost:3000" "http://127.0.0.1:3000"), geolocation=()');
  next();
});

// ----------------------------------------------------
// Router Registrations
// ----------------------------------------------------

// Auth routes — rate limited
app.post('/api/auth/login', authLimiter);
app.post('/api/auth/signup', signupLimiter);
app.use('/api/auth', authRouter);

// Apply general rate limit + CSRF to state-changing routes
app.use('/api/jobs', apiLimiter, csrfProtection, jobsRouter);
app.use('/api/marketplace', apiLimiter, csrfProtection, marketplaceRouter);
app.use('/api/chat', apiLimiter, csrfProtection, chatRouter);
app.use('/api/admin', apiLimiter, csrfProtection, adminRouter);
app.use('/api/agents', apiLimiter, csrfProtection, agentsRouter);
app.use('/api/resume', apiLimiter, csrfProtection, resumeRouter);
app.use('/api/payments', apiLimiter, csrfProtection, paymentsRouter);
app.use('/api/reviews', apiLimiter, csrfProtection, reviewsRouter);

// Your AI agent payment route (Exempt from CSRF/RateLimit for mock hackathon flow)
app.use('/api/payment', paymentRouter);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err.message);
  // Fail-safe generic response to prevent stack/source leakages
  res.status(500).json({ error: 'An unexpected error occurred on the server.' });
});

// ----------------------------------------------------
// Seed Default Platform Accounts
// ----------------------------------------------------
const seedPlatformAccounts = async () => {
  try {
    // 1. Seed AI Employees
    await dbService.seedData();

    // 2. Seed Admin account
    const adminEmail = 'admin@hive.com';
    const adminUser = await dbService.getUserByEmail(adminEmail);
    if (!adminUser) {
      const adminPass = await bcrypt.hash('password123', 10);
      await dbService.createUser({
        username: 'Hive Administrator',
        email: adminEmail,
        password: adminPass,
        role: 'Admin',
        avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Admin'
      });
      console.log('Admin account seeded: admin@hive.com / password123');
    }

    // 3. Seed Mock Human Workers
    const workers = await dbService.getUsers({ role: 'Worker' });
    if (workers.length === 0) {
      const mockWorkers = [
        {
          username: 'Alice Vance',
          email: 'alice@hive.com',
          skills: ['React', 'Next.js', 'Node.js', 'TypeScript', 'Tailwind CSS'],
          location: 'San Francisco, CA (Remote)',
          hourlyPrice: 75,
          experience: 'Senior Developer',
          availability: 'Available',
          rating: 4.9,
          reviews: [
            { reviewer: 'TechCorp CEO', rating: 5, comment: 'Alice built our MVP landing page in 3 days. Clean Next.js code!' },
            { reviewer: 'BuildFast Inc', rating: 4.8, comment: 'Very professional developer, highly recommended.' }
          ]
        },
        {
          username: 'Bob Miller',
          email: 'bob@hive.com',
          skills: ['Figma', 'UI/UX Design', 'Branding', 'Vector Illustration', 'Framer'],
          location: 'New York, NY (Remote)',
          hourlyPrice: 55,
          experience: 'Mid-level Designer',
          availability: 'Available',
          rating: 4.8,
          reviews: [
            { reviewer: 'Innovate LLC', rating: 5, comment: 'Designed a beautiful dashboard layout with amazing purple colors.' }
          ]
        },
        {
          username: 'Charlie Writing',
          email: 'charlie@hive.com',
          skills: ['SEO Copywriting', 'Technical Writing', 'Blog Content', 'Copy Editing'],
          location: 'Austin, TX (Remote)',
          hourlyPrice: 40,
          experience: 'Senior Writer',
          availability: 'Available',
          rating: 4.7,
          reviews: [
            { reviewer: 'SaaS Pulse', rating: 4, comment: 'Charlie wrote high-quality blog posts that ranked #1 on Google.' }
          ]
        },
        {
          username: 'Diana Marketer',
          email: 'diana@hive.com',
          skills: ['Google Ads', 'SEO Optimization', 'Social Media Strategy', 'Growth Marketing'],
          location: 'London, UK (Remote)',
          hourlyPrice: 60,
          experience: 'Mid-level Marketer',
          availability: 'Busy',
          rating: 4.9,
          reviews: [
            { reviewer: 'WebScale', rating: 5, comment: 'Diana tripled our signups using targeted PPC campaigns.' }
          ]
        }
      ];

      for (const w of mockWorkers) {
        const hashedPass = await bcrypt.hash('password123', 10);
        await dbService.createUser({
          ...w,
          password: hashedPass,
          role: 'Worker',
          avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(w.username)}`
        });
      }
      console.log('Mock Human Workers seeded: [alice, bob, charlie, diana]@hive.com / password123');
    }
  } catch (error) {
    console.error('Seeding error:', error);
  }
};

// Start Server
app.listen(PORT, '0.0.0.0', async () => {
  console.log(`Hive Backend Server listening on port ${PORT} [Mode: ${dbMode}]`);
  await seedPlatformAccounts();
});