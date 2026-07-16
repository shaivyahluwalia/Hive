import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getJWTSecret } from '../middleware/auth.js';

async function runTests() {
  console.log('--- STARTING AUTHENTICATION VERIFICATION TESTS ---');

  // Test 1: Password hashing strength and comparison
  console.log('Test 1: Verifying password hashing...');
  const plainPassword = 'SuperStrongPassword123!';
  const hash = await bcrypt.hash(plainPassword, 10);
  
  if (!hash.startsWith('$2a$') && !hash.startsWith('$2b$')) {
    console.error('❌ Fail: Invalid bcrypt prefix.');
    process.exit(1);
  }
  
  const isMatch = await bcrypt.compare(plainPassword, hash);
  if (!isMatch) {
    console.error('❌ Fail: Password comparison failed.');
    process.exit(1);
  }
  console.log('✅ Pass: Password hashing and comparison verified.');

  // Test 2: JWT generation and verification
  console.log('Test 2: Verifying JWT signing and verification...');
  const secret = getJWTSecret();
  const payload = { id: 'test-user-id', role: 'Business' };
  
  // Sign JWT
  const token = jwt.sign(payload, secret, { algorithm: 'HS256', expiresIn: '1h' });
  
  // Verify JWT
  const decoded = jwt.verify(token, secret, { algorithms: ['HS256'] });
  if (decoded.id !== payload.id || decoded.role !== payload.role) {
    console.error('❌ Fail: JWT payload mismatch.');
    process.exit(1);
  }
  console.log('✅ Pass: JWT signing and verification verified.');

  console.log('--- ALL AUTH VERIFICATION TESTS PASSED SUCCESSFULLY ---');
}

runTests().catch(err => {
  console.error('❌ Test execution encountered an error:', err);
  process.exit(1);
});
