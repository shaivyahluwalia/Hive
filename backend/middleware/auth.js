import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { dbService } from '../models/dbService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SECRET_FILE = path.join(__dirname, '../jwt_secret.txt');

// Secure multi-tiered JWT secret fallback resolution
export function getJWTSecret() {
  if (process.env.JWT_SECRET) {
    return process.env.JWT_SECRET;
  }
  if (fs.existsSync(SECRET_FILE)) {
    return fs.readFileSync(SECRET_FILE, 'utf-8').trim();
  }
  console.warn("Generating ephemeral JWT secret. Instance-isolated!");
  const secret = crypto.randomBytes(32).toString('hex');
  try {
    fs.writeFileSync(SECRET_FILE, secret, 'utf-8');
  } catch (err) {
    console.error('Failed to save JWT secret to file:', err);
  }
  return secret;
}

const JWT_SECRET = getJWTSecret();

export const requireAuth = async (req, res, next) => {
  try {
    const token = req.cookies.hive_session;
    if (!token) {
      return res.status(401).json({ error: 'Authentication required. No session cookie found.' });
    }

    // Verify token with hardcoded HS256 algorithm to prevent algorithm confusion attacks
    jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] }, async (err, decoded) => {
      if (err) {
        return res.status(401).json({ error: 'Session expired or invalid token.' });
      }

      const user = await dbService.getUserById(decoded.id);
      if (!user) {
        return res.status(401).json({ error: 'User associated with this session no longer exists.' });
      }

      // Attach user details to request object
      req.user = {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      };
      next();
    });
  } catch (error) {
    console.error('Authentication middleware error:', error);
    res.status(500).json({ error: 'Internal server error during authentication.' });
  }
};

export const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden: Insufficient privileges.' });
    }
    next();
  };
};
