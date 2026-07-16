import { predictWorkerType } from '../services/aiService.js';

async function runTests() {
  console.log('--- STARTING AI CLASSIFICATION VERIFICATION TESTS ---');

  // Test Case 1: Creative writing / copywriting
  console.log('Test Case 1: Analyzing copywriting job...');
  const res1 = await predictWorkerType(
    'Write Instagram captions',
    'We need a set of 15 catch captions for our new organic coffee product line to post on Instagram.',
    'Writing',
    50
  );
  console.log(`- Predicted Worker Type: "${res1.workerType}"`);
  console.log(`- Confidence Score: ${res1.confidence}`);
  console.log(`- Reasoning: "${res1.reasoning}"`);
  
  if (res1.workerType !== 'AI Employee') {
    console.error('❌ Fail: Expected AI Employee for small copywriting task.');
    process.exit(1);
  }
  console.log('✅ Pass: Copywriting task correctly routed to AI Employee.');

  // Test Case 2: In-person physical task
  console.log('Test Case 2: Analyzing physical labor/photography job...');
  const res2 = await predictWorkerType(
    'Wedding Photography services',
    'Hire an experienced photographer to capture high resolution imagery for our wedding event in Central Park.',
    'Photography',
    800
  );
  console.log(`- Predicted Worker Type: "${res2.workerType}"`);
  console.log(`- Confidence Score: ${res2.confidence}`);
  
  if (res2.workerType !== 'Human Worker') {
    console.error('❌ Fail: Expected Human Worker for physical photography task.');
    process.exit(1);
  }
  console.log('✅ Pass: Physical task correctly routed to Human Worker.');

  // Test Case 3: Enterprise development task
  console.log('Test Case 3: Analyzing complex development job...');
  const res3 = await predictWorkerType(
    'Build SaaS Platform',
    'Create a comprehensive AI plus Human workforce marketplace web application with Next.js App Router, Express server, and secure JWT auth systems.',
    'Development',
    2500
  );
  console.log(`- Predicted Worker Type: "${res3.workerType}"`);
  console.log(`- Confidence Score: ${res3.confidence}`);

  if (res3.workerType !== 'Human + AI Collaboration') {
    console.error('❌ Fail: Expected Human + AI Collaboration for high-budget development project.');
    process.exit(1);
  }
  console.log('✅ Pass: Complex development project correctly routed to Hybrid squad.');

  console.log('--- ALL AI VERIFICATION TESTS PASSED SUCCESSFULLY ---');
}

runTests().catch(err => {
  console.error('❌ Test execution encountered an error:', err);
  process.exit(1);
});
