import crypto from 'crypto';

export const csrfProtection = (req, res, next) => {
  // Skip CSRF validation for safe HTTP methods
  const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
  if (safeMethods.includes(req.method)) {
    return next();
  }

  const cookieToken = req.cookies.csrf_token;
  const headerToken = req.headers['x-csrf-token'];

  if (!cookieToken || !headerToken) {
    return res.status(403).json({ error: 'CSRF validation failed: Missing token.' });
  }

  // Validate match
  if (cookieToken !== headerToken) {
    return res.status(403).json({ error: 'CSRF validation failed: Token mismatch.' });
  }

  next();
};

export const generateCsrfToken = () => {
  return crypto.randomBytes(32).toString('hex');
};
