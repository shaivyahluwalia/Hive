import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { dbService } from '../models/dbService.js';
import { requireAuth } from '../middleware/auth.js';
import { resumeUpload } from '../middleware/upload.js';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

/**
 * POST /api/resume/upload
 * Worker uploads their CV file (PDF/DOC/DOCX, max 5MB)
 * Body (multipart/form-data):
 *   - file: the resume file
 *   - skills: comma-separated skills string
 *   - experience: experience range string
 *   - bio: short bio text
 */
router.post('/upload', requireAuth, (req, res) => {
  if (req.user.role !== 'Worker') {
    return res.status(403).json({ error: 'Only worker accounts can upload a resume.' });
  }

  resumeUpload.single('file')(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }

    try {
      const { skills, experience, bio } = req.body;
      const updateObj = {};

      if (req.file) {
        updateObj.resumePath = req.file.filename;
      }
      if (skills !== undefined)    updateObj.resumeSkills = String(skills).slice(0, 500);
      if (experience !== undefined) updateObj.resumeExp   = String(experience).slice(0, 100);
      if (bio !== undefined)        updateObj.resumeBio   = String(bio).slice(0, 600);

      const updated = await dbService.updateUser(req.user.id, updateObj);
      if (!updated) {
        return res.status(404).json({ error: 'User not found.' });
      }

      const { password: _, ...safe } = updated;
      res.json({
        message: 'Resume uploaded and profile updated successfully.',
        user: safe,
        filename: req.file?.filename || null
      });
    } catch (error) {
      console.error('Resume upload error:', error);
      res.status(500).json({ error: 'Failed to save resume information.' });
    }
  });
});

/**
 * GET /api/resume/me
 * Returns the authenticated worker's resume metadata
 */
router.get('/me', requireAuth, async (req, res) => {
  try {
    const user = await dbService.getUserById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found.' });

    res.json({
      resumePath:   user.resumePath   || null,
      resumeSkills: user.resumeSkills || '',
      resumeExp:    user.resumeExp    || '',
      resumeBio:    user.resumeBio    || ''
    });
  } catch (error) {
    console.error('Get resume error:', error);
    res.status(500).json({ error: 'Failed to retrieve resume info.' });
  }
});

/**
 * GET /api/resume/file/:filename
 * Serves the actual resume file for download
 */
router.get('/file/:filename', requireAuth, (req, res) => {
  const filename = path.basename(req.params.filename); // sanitize traversal
  const filePath = path.join(__dirname, '../../uploads/resumes', filename);
  res.download(filePath, (err) => {
    if (err) res.status(404).json({ error: 'File not found.' });
  });
});

export default router;
