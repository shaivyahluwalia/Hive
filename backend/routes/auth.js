import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { dbService } from '../models/dbService.js';
import { getJWTSecret } from '../middleware/auth.js';
import { generateCsrfToken } from '../middleware/csrf.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();
const JWT_SECRET = getJWTSecret();

// GET /api/auth/csrf
router.get('/csrf', (req, res) => {
  const token = generateCsrfToken();
  const isProd = process.env.NODE_ENV === 'production';
  
  // Set CSRF token as a client-readable cookie (httpOnly: false)
  res.cookie('csrf_token', token, {
    httpOnly: false,
    secure: isProd,
    sameSite: 'lax',
    path: '/',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  });
  
  res.json({ csrfToken: token });
});

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    if (!username || !email || !password || !role) {
      return res.status(400).json({ error: 'All fields (username, email, password, role) are required.' });
    }

    if (!['Business', 'Worker'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role selection.' });
    }

    // Password strength check (min 8 characters)
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long.' });
    }

    // Check if email already exists
    const existingUser = await dbService.getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'An account with this email address already exists.' });
    }

    // Hash password with bcryptjs
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const userObj = {
      username,
      email,
      password: hashedPassword,
      role,
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(username)}`
    };

    const newUser = await dbService.createUser(userObj);

    // Return success without password
    const { password: _, ...userWithoutPassword } = newUser;
    res.status(201).json({ message: 'User registered successfully.', user: userWithoutPassword });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Internal server error during registration.' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = await dbService.getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Create JWT
    const token = jwt.sign(
      { id: user._id, role: user.role },
      JWT_SECRET,
      { algorithm: 'HS256', expiresIn: '24h' }
    );

    const isProd = process.env.NODE_ENV === 'production';

    // Set JWT in a HttpOnly secure cookie
    res.cookie('hive_session', token, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      path: '/',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });

    const { password: _, ...userWithoutPassword } = user;
    res.json({ message: 'Logged in successfully.', user: userWithoutPassword });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error during authentication.' });
  }
});

// GET /api/auth/me
router.get('/me', requireAuth, async (req, res) => {
  try {
    const user = await dbService.getUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User details not found.' });
    }
    const { password: _, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  res.clearCookie('hive_session', { path: '/' });
  res.clearCookie('csrf_token', { path: '/' });
  res.json({ message: 'Logged out successfully.' });
});

// POST /api/auth/profile
router.post('/profile', requireAuth, async (req, res) => {
  try {
    const { skills, hourlyPrice, availability, location } = req.body;
    const updateObj = {};
    if (skills) updateObj.skills = skills;
    if (hourlyPrice !== undefined) updateObj.hourlyPrice = parseFloat(hourlyPrice);
    if (availability) updateObj.availability = availability;
    if (location) updateObj.location = location;

    const updatedUser = await dbService.updateUser(req.user.id, updateObj);
    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found.' });
    }
    const { password: _, ...userWithoutPassword } = updatedUser;
    res.json({ message: 'Profile updated successfully.', user: userWithoutPassword });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile.' });
  }
});

export default router;
